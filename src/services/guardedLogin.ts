import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { ensureUserProfile } from "./authService";
import type { User } from "../types";
import { invokeWithFallback } from "./functionInvoker";

type GuardReason = "company_mismatch" | "company_not_found" | "unknown_email" | "invalid_login" | "unknown";

interface GuardCheckResponse {
  ok?: boolean | null;
  allowed?: boolean | null;
  reason?: GuardReason | null;
}

export type GuardedLoginErrorKey =
  | "login.error.invalidCompanyCredentials"
  | "login.error.invalidCredentials"
  | "login.error.companyIdMismatch"
  | "login.error.companyNotFound"
  | "login.error.unknownEmail"
  | "login.error.profileFetchFailed";

export class GuardedLoginError extends Error {
  readonly translationKey: GuardedLoginErrorKey;

  constructor(translationKey: GuardedLoginErrorKey, message?: string) {
    super(message ?? translationKey);
    this.name = "GuardedLoginError";
    this.translationKey = translationKey;
  }
}

export interface GuardedLoginSuccess {
  session: Session;
  profile: User;
}

const mapReasonToErrorKey = (reason?: GuardReason | null): GuardedLoginErrorKey => {
  if (reason === "company_mismatch") {
    return "login.error.companyIdMismatch";
  }
  if (reason === "company_not_found") {
    return "login.error.companyNotFound";
  }
  if (reason === "unknown_email") {
    return "login.error.unknownEmail";
  }
  return "login.error.invalidCompanyCredentials";
};

const assertGuardAllowed = (payload: GuardCheckResponse | null | undefined, fallbackReason?: GuardReason | null) => {
  const reasonKey = mapReasonToErrorKey(payload?.reason ?? fallbackReason ?? undefined);
  if (!payload?.ok || payload.allowed === false) {
    throw new GuardedLoginError(reasonKey);
  }
};

export const guardedLogin = async (
  email: string,
  password: string,
  companyName: string
): Promise<GuardedLoginSuccess> => {
  const guardResult = await invokeWithFallback<GuardCheckResponse>(
    "login-guard",
    { email, company: companyName },
    "/api/login-guard"
  );

  if (guardResult.error) {
    const { status, context, message, isNetworkError } = guardResult.error;
    const reason = (context?.reason ?? context?.error) as GuardReason | undefined;

    if (status === 403) {
      throw new GuardedLoginError(mapReasonToErrorKey(reason));
    }

    if (isNetworkError) {
      throw new GuardedLoginError("login.error.invalidCompanyCredentials", message);
    }

    if (status && status >= 400) {
      throw new GuardedLoginError(mapReasonToErrorKey(reason));
    }

    throw new GuardedLoginError("login.error.invalidCompanyCredentials", message);
  }

  const preloginPayload = guardResult.data ?? null;
  assertGuardAllowed(preloginPayload);

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !authData.user || !authData.session) {
    console.warn("guardedLogin: signInWithPassword failed", signInError?.message ?? "missing session");
    await supabase.auth.signOut().catch((error) => console.warn("guardedLogin: signOut cleanup failed", error));
    throw new GuardedLoginError("login.error.invalidCredentials", signInError?.message);
  }

  const { data: assertionData, error: assertionError } = await supabase.rpc(
    "postlogin_assert_company",
    {
      p_company_name: companyName,
    }
  );

  if (assertionError) {
    console.error("guardedLogin: postlogin_assert_company RPC failed", assertionError.message);
    await supabase.auth.signOut().catch((error) => console.warn("guardedLogin: signOut cleanup failed", error));
    throw new GuardedLoginError("login.error.companyIdMismatch", assertionError.message);
  }

  const assertionPayload = (assertionData as GuardCheckResponse | null) ?? null;
  try {
    assertGuardAllowed(assertionPayload, "company_mismatch");
  } catch (error) {
    await supabase.auth.signOut().catch((signOutError) =>
      console.warn("guardedLogin: signOut cleanup after assertion failed", signOutError)
    );
    throw error;
  }

  await ensureUserProfile().catch((error) => console.warn("guardedLogin: ensureUserProfile warning", error));

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_uid", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error("guardedLogin: unable to fetch user profile", profileError?.message ?? "not found");
    await supabase.auth.signOut().catch((error) => console.warn("guardedLogin: signOut cleanup after profile failed", error));
    throw new GuardedLoginError("login.error.profileFetchFailed", profileError?.message);
  }

  return {
    session: authData.session,
    profile: profile as User,
  };
};

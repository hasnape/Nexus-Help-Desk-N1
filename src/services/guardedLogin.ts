import { supabase } from "./supabaseClient";

export type GuardedLoginFailureReason =
  | "company_mismatch"
  | "company_not_found"
  | "unknown_email"
  | "invalid_login"
  | "unknown";

export interface GuardedLoginResult {
  ok: boolean;
  reason?: GuardedLoginFailureReason;
}

interface GuardResponseBody {
  ok?: boolean;
  allowed?: boolean;
  reason?: string | null;
  error?: string | null;
}

const parseJsonSafely = async (response: Response): Promise<GuardResponseBody | null> => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }
  try {
    const data = (await response.json()) as GuardResponseBody;
    return data;
  } catch (error) {
    console.warn("guardedLogin: unable to parse JSON response", error);
    return null;
  }
};

const normalizeReason = (
  reason: string | null | undefined
): GuardedLoginFailureReason | undefined => {
  if (!reason) {
    return undefined;
  }

  if (
    reason === "company_mismatch" ||
    reason === "company_not_found" ||
    reason === "unknown_email"
  ) {
    return reason;
  }

  if (reason === "invalid_login") {
    return "invalid_login";
  }

  if (reason === "unknown") {
    return "unknown";
  }

  return undefined;
};

export const guardedLogin = async (
  email: string,
  password: string,
  company: string
): Promise<GuardedLoginResult> => {
  try {
    const guardResponse = await fetch("/functions/v1/login-guard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, company }),
    });

    const guardBody = await parseJsonSafely(guardResponse);

    if (guardResponse.status === 403) {
      const parsedReason = normalizeReason(guardBody?.reason) ?? "company_mismatch";
      return { ok: false, reason: parsedReason };
    }

    if (!guardResponse.ok) {
      const parsedReason = normalizeReason(guardBody?.reason);
      if (parsedReason) {
        return { ok: false, reason: parsedReason };
      }
      return { ok: false, reason: "unknown" };
    }

    if (guardBody?.allowed === false) {
      const parsedReason = normalizeReason(guardBody.reason) ?? "company_mismatch";
      return { ok: false, reason: parsedReason };
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user) {
      console.warn("guardedLogin: login rejected", signInError?.message);
      return { ok: false, reason: "invalid_login" };
    }

    const { data: postLoginData, error: postLoginError } = await supabase.rpc(
      "postlogin_assert_company",
      {
        p_company_name: company,
      }
    );

    if (postLoginError) {
      console.error("guardedLogin: post-login assertion RPC failed", postLoginError.message);
      await supabase.auth.signOut();
      return { ok: false, reason: "unknown" };
    }

    const postLoginBody = postLoginData as GuardResponseBody | null;
    if (postLoginBody?.allowed === false) {
      const parsedReason = normalizeReason(postLoginBody.reason) ?? "company_mismatch";
      await supabase.auth.signOut();
      return { ok: false, reason: parsedReason };
    }

    return { ok: true };
  } catch (error) {
    console.error("guardedLogin: unexpected failure", error);
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn("guardedLogin: cleanup signOut failed", signOutError);
    }
    return { ok: false, reason: "unknown" };
  }
};

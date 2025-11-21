import type { TFunction } from "i18next";

interface SignupErrorOptions {
  companyName?: string;
}

export function signupErrorMapper(
  t: TFunction,
  reason?: unknown,
  message?: unknown,
  status?: number,
  options?: SignupErrorOptions,
): string {
  const reasonKey = typeof reason === "string" ? reason : undefined;

  if (reasonKey) {
    const translated = t(`signup.apiErrors.${reasonKey}`, {
      companyName: options?.companyName,
      defaultValue: "",
    });
    if (translated) {
      return translated;
    }
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (status && status >= 500) {
    return t("auth.signup.genericError");
  }

  return t("auth.signup.genericError", {
    defaultValue: t("signup.error.generic"),
  });
}

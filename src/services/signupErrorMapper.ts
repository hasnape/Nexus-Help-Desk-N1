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

  if (status === 409) {
    if (reasonKey === "company_in_use") {
      return (
        t("signup.apiErrors.company_in_use", {
          companyName: options?.companyName,
          defaultValue: "This company is already registered. Please log in instead.",
        }) || "This company is already registered. Please log in instead."
      );
    }

    return (
      t("signup.apiErrors.email_in_use", {
        defaultValue:
          "An account with this email already exists. Please try logging in instead.",
      }) ||
      "An account with this email already exists. Please try logging in instead."
    );
  }

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

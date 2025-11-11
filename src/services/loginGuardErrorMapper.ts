export type Translator = (key: string, options?: Record<string, any>) => string;

export const mapLoginGuardError = (
  t: Translator,
  reason?: string,
  message?: string
): string => {
  switch (reason) {
    case "company_conflict":
      return t("login.error.companyConflict", {
        default: "This company is locked. Please contact your manager.",
      });
    case "company_missing":
      return t("login.error.companyNotFound");
    case "origin_not_allowed":
      return t("login.error.originNotAllowed", {
        default: "This application cannot reach the authentication service from your origin.",
      });
    case "not_allowed":
    case "forbidden":
      return t("login.error.guardNotAllowed", {
        default: "Login blocked for this company. Contact your administrator.",
      });
    default:
      return (
        message ||
        t("login.error.guardFailed", {
          default: "Login guard failed. Please try again later.",
        })
      );
  }
};

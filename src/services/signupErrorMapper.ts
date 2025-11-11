export type Translator = (key: string, options?: Record<string, any>) => string;

export const mapSignupError = (
  t: Translator,
  code?: string,
  message?: string,
  context: { companyName?: string } = {}
): string => {
  const { companyName } = context;

  switch (code) {
    case "company_conflict":
      return t("signup.error.companyNameTaken");
    case "company_missing":
      return t("signup.error.companyNotFound", { companyName });
    case "invalid_role":
      return t("signup.error.invalidRole", {
        default: "The selected role is not allowed for this operation.",
      });
    case "missing_fields":
      return t("signup.error.allFieldsRequired");
    case "company_create_failed":
      return t("signup.error.companyCreateFailed");
    case "company_lookup_failed":
    case "manager_lookup_failed":
      return t("signup.error.companyLookupFailed", {
        default: "Unable to verify the company. Please try again later.",
      });
    case "user_create_failed":
      return t("signup.error.userCreateFailed", {
        default: "Failed to create the user account. Please try again.",
      });
    case "profile_insert_failed":
      return t("signup.error.profileInsertFailed", {
        default: "Failed to save the user profile. Please try again.",
      });
    default:
      return message || t("signup.error.generic");
  }
};

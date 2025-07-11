import React, { useState, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../App";
import { Button, Input, Select } from "../components/FormElements";
import { useTranslation } from "react-i18next";
import { UserRole, Plan } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const SignUpPage: React.FC = () => {
  // Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [companyName, setCompanyName] = useState("");
  const [plan, setPlan] = useState<Plan>("freemium");
  const [activationCode, setActivationCode] = useState("");

  // Logic State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, user } = useApp();
  const { t, i18n } = useTranslation(["signup", "pricing", "common", "enums"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handlePayPalPayment = () => {
    const paypalUrl =
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0E515487AE797135CNBTRYKA";
    window.open(paypalUrl, "_blank");
  };

  const handlePayPalProPayment = () => {
    const paypalProUrl =
      "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-7HP75881LB3608938NBTBGUA";
    window.open(paypalProUrl, "_blank");
  };

  const roleOptions = [
    { value: UserRole.USER, label: t("enums:userRole.user") },
    { value: UserRole.AGENT, label: t("enums:userRole.agent") },
    { value: UserRole.MANAGER, label: t("enums:userRole.manager") },
  ];

  const pricingTiers = [
    {
      nameKey: "pricing:freemium.name",
      planValue: "freemium" as Plan,
      icon: <FreemiumPlanIcon className="w-8 h-8 text-slate-400" />,
      priceKey: "pricing:freemium.price",
      features: [
        t("pricing:freemium.feature1"),
        t("pricing:freemium.feature2"),
        t("pricing:freemium.feature3"),
        t("pricing:freemium.feature4"),
        t("pricing:freemium.feature5"),
      ],
    },
    {
      nameKey: "pricing:standard.name",
      planValue: "standard" as Plan,
      icon: <StandardPlanIcon className="w-8 h-8 text-primary" />,
      priceKey: "pricing:standard.price",
      features: [
        t("pricing:standard.feature1"),
        t("pricing:standard.feature2"),
        t("pricing:standard.feature3"),
        t("pricing:standard.feature4"),
        t("pricing:standard.feature5"),
      ],
    },
    {
      nameKey: "pricing:pro.name",
      planValue: "pro" as Plan,
      icon: <ProPlanIcon className="w-8 h-8 text-amber-500" />,
      priceKey: "pricing:pro.price",
      features: [
        t("pricing:pro.feature1"),
        t("pricing:pro.feature2"),
        t("pricing:pro.feature3"),
        t("pricing:pro.feature4"),
      ],
    },
  ];

  const validateDetails = (): boolean => {
    if (
      !email.trim() ||
      !fullName.trim() ||
      !password ||
      !confirmPassword ||
      !companyName.trim()
    ) {
      setError(t("error.allFieldsRequired"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t("error.passwordsDoNotMatch"));
      return false;
    }
    if (password.length < 6) {
      setError(t("error.minCharsPassword"));
      return false;
    }
    if (
      role === UserRole.MANAGER &&
      plan !== "freemium" &&
      !activationCode.trim()
    ) {
      setError(t("error.activationCodeRequired"));
      return false;
    }
    setError("");
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    // Client-side activation code check for demo purposes
    if (role === UserRole.MANAGER) {
      if (
        plan === "standard" &&
        activationCode.trim() !== "STANDARD_SECRET_CODE"
      ) {
        setError(t("error.invalidActivationCode"));
        return;
      }
      if (plan === "pro" && activationCode.trim() !== "PRO_SECRET_CODE") {
        setError(t("error.invalidActivationCode"));
        return;
      }
    }

    setIsLoading(true);
    setError("");

    const result = await signUp(email.trim(), fullName.trim(), password, {
      lang: selectedLanguage as any,
      role: role,
      companyName: companyName.trim(),
      plan: role === UserRole.MANAGER ? plan : undefined,
    });

    setIsLoading(false);

    if (result !== true) {
      setError(result);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200">
          <LoadingSpinner size="lg" text={t("finalizing")} />
          <p className="mt-4 text-gray-600">{t("finalizingSubtitle")}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200">
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-blue-600 mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5A5.625 5.625 0 0 1 15.75 21H8.25A5.625 5.625 0 0 1 2.25 15.375V8.625c0-1.062.31-2.073.856-2.922m1.025-.975A3.75 3.75 0 0 0 6 5.25v1.5c0 .621.504 1.125 1.125 1.125H9"
              />
            </svg>
            <h1 className="text-3xl font-bold text-black">{t("title")}</h1>
            <p className="text-gray-700 mt-1">{t("subtitle")}</p>
          </div>

          {error && (
            <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">
              {error}
            </p>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("emailLabel")}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label={t("fullNameLabel")}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label={t("passwordLabel")}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label={t("confirmPasswordLabel")}
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Select
              label={t("roleLabel")}
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={roleOptions}
              required
            />

            <div>
              <Input
                label={
                  role === UserRole.MANAGER
                    ? t("companyNameLabel")
                    : t("existingCompanyNameLabel")
                }
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            {role === UserRole.MANAGER && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("planSelection.title")}
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("planSelection.subtitle")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricingTiers.map((tier) => (
                      <div
                        key={tier.planValue}
                        onClick={() => setPlan(tier.planValue)}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col text-center transition-all duration-200 ${
                          plan === tier.planValue
                            ? "border-primary ring-2 ring-primary ring-offset-2 shadow-lg"
                            : "border-slate-200 hover:border-primary/70 hover:shadow-md"
                        }`}
                      >
                        <div className="mx-auto mb-3">{tier.icon}</div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          {t(tier.nameKey)}
                        </h3>
                        <div className="my-2">
                          {tier.planValue === "freemium" ? (
                            <p className="text-xl font-bold text-green-600">
                              {t(tier.priceKey)}
                            </p>
                          ) : tier.planValue === "standard" ? (
                            <div>
                              <p className="text-xl font-bold text-blue-600">
                                {t(tier.priceKey)}
                                {t("signup.planSelection.perAgentPerMonth")}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                {t("signup.planSelection.originalPrice")}{" "}
                                {t("pricing.standard.originalPrice")}
                                {t("signup.planSelection.perAgentPerMonth")}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xl font-bold text-amber-600">
                                {t(tier.priceKey)}
                                {t("signup.planSelection.perAgentPerMonth")}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                {t("signup.planSelection.originalPrice")}{" "}
                                {t("pricing.pro.originalPrice")}
                                {t("signup.planSelection.perAgentPerMonth")}
                              </p>
                            </div>
                          )}
                        </div>
                        <ul className="mt-4 space-y-2 text-xs text-slate-600 text-left flex-grow">
                          {tier.features.map((featureKey) => (
                            <li key={featureKey} className="flex items-start">
                              <CheckIcon className="w-4 h-4 text-green-500 me-2 mt-0.5 flex-shrink-0" />
                              <span>{t(featureKey)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {plan !== "freemium" && (
                  <div>
                    <Input
                      label={t("activationCodeLabel")}
                      id="activationCode"
                      type="text"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder={t("activationCodePlaceholder")}
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {t("activationCodeNote")}
                    </p>
                  </div>
                )}

                {plan === "standard" && (
                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={handlePayPalPayment}
                      variant="outline"
                      size="sm"
                    >
                      {t("planSelection.payWithPayPal")}
                    </Button>
                  </div>
                )}

                {plan === "pro" && (
                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={handlePayPalProPayment}
                      variant="outline"
                      size="sm"
                    >
                      {t("planSelection.payWithPayPal")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button type="submit" variant="primary" size="lg">
                {t("signUpButton")}
              </Button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                {t("loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default SignUpPage;

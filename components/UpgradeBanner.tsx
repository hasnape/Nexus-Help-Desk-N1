import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./FormElements";

interface UpgradeBannerProps {
  percent: number;
  className?: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ percent, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roundedPercent = Number.isFinite(percent) ? Math.round(percent) : percent;

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/10 p-6 text-primary-900 shadow-sm lg:flex-row lg:items-center lg:justify-between ${className ?? ""}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div>
        <h3 className="text-lg font-semibold">
          {t("upgradeBanner.title", { percent: roundedPercent })}
        </h3>
        <p className="mt-1 text-sm text-primary-800">
          {t("upgradeBanner.subtitle")}
        </p>
      </div>
      <div>
        <Button onClick={() => navigate("/pricing")} variant="secondary">
          {t("upgradeBanner.cta")}
        </Button>
      </div>
    </div>
  );
};

export default UpgradeBanner;

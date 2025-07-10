import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const { t } = useTranslation(["common", "components"]);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <Suspense
      fallback={
        <div className={`flex items-center ${className}`}>
          <div
            className={`bg-gray-300 rounded ${sizeClasses[size]} animate-pulse`}
          />
          {showText && (
            <div className="ml-2 h-4 bg-gray-300 rounded w-24 animate-pulse" />
          )}
        </div>
      }
    >
      <div className={`flex items-center ${className}`}>
        {/* Logo Icon */}
        <div
          className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold ${sizeClasses[size]}`}
        >
          <span
            className={
              size === "sm"
                ? "text-xs"
                : size === "lg" || size === "xl"
                ? "text-lg"
                : "text-sm"
            }
          >
            N
          </span>
        </div>

        {/* Logo Text */}
        {showText && (
          <div className="ml-2">
            <span
              className={`font-bold text-gray-800 ${textSizeClasses[size]}`}
            >
              {t("appName")}
            </span>
            {(size === "lg" || size === "xl") && (
              <div className="text-xs text-gray-500">
                {t("logo.tagline", { ns: "components" })}
              </div>
            )}
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default Logo;

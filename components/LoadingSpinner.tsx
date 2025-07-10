import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const { t } = useTranslation(["common", "components"]);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const displayText = text || t("loadingSpinner.loading");

  return (
    <Suspense
      fallback={
        <div
          className={`flex flex-col items-center justify-center p-4 ${className}`}
        >
          <div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
          />
        </div>
      }
    >
      <div
        className={`flex flex-col items-center justify-center p-4 ${className}`}
      >
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        />
        {text !== false && (
          <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
            {displayText}
          </p>
        )}
      </div>
    </Suspense>
  );
};

export default LoadingSpinner;

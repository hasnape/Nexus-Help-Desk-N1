import React from "react";
// import supprimé

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
  // Traductions supprimées, tout est statique en français

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

  const displayText = text || "Chargement...";

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      />
      {typeof text === "string" && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      )}
      {text === undefined && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          Chargement...
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

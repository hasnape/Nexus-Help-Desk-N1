import React from "react";

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
    <div
      className={`flex items-center ${className}`}
      aria-label="Logo Nexus Help Desk"
    >
      {/* Logo personnalisé */}
      <img
        src="/logo.png"
        alt="Logo Nexus Help Desk"
        className={`${sizeClasses[size]} object-contain`}
      />
      {/* Logo Text */}
      {showText && (
        <div className="ml-2">
          <span
            className={`font-bold text-gray-800 ${textSizeClasses[size]}`}
            aria-label="Nom de l'application"
          >
            Nexus Help Desk
          </span>
          {(size === "lg" || size === "xl") && (
            <div className="text-xs text-gray-500" aria-label="Slogan du logo">
              Assistance simplifiée pour tous
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

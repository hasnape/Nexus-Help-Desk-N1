import React from "react";

interface MarketingLayoutProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({
  children,
  className = "",
  mainClassName = "page-shell py-12 lg:py-16",
}) => {
  return (
    <div className={`${mainClassName}`}>
      {/* Navbar and Footer are provided by the global Layout wrapper */}
      <div className={`page-container marketing-layout ${className}`}>{children}</div>
    </div>
  );
};

export default MarketingLayout;

import React from "react";
import Layout from "./Layout";

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
    <Layout mainClassName={mainClassName}>
      <div className={`page-container marketing-layout ${className}`}>{children}</div>
    </Layout>
  );
};

export default MarketingLayout;

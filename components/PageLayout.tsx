import React from "react";
import { useApp } from "@/contexts/AppContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UpgradeBanner from "./UpgradeBanner";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { quotaUsagePercent } = useApp();
  const showUpgradeBanner =
    typeof quotaUsagePercent === "number" && quotaUsagePercent >= 80 && quotaUsagePercent < 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar />
      <main className="flex-grow container mx-auto py-12 px-4">
        {showUpgradeBanner && (
          <div className="mb-6">
            <UpgradeBanner percent={quotaUsagePercent} />
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;

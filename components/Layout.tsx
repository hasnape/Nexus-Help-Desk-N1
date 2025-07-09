import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useSidebar } from "../contexts/SidebarContext";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}

      {/* Contenu principal avec marge adaptative */}
      <div
        className={`transition-all duration-300 ${
          showSidebar ? (isExpanded ? "ml-64" : "ml-16") : "ml-0"
        }`}
      >
        <Navbar showSidebar={showSidebar} />
        <main className="pt-16">{/* contenu de la page */}</main>
      </div>
    </div>
  );
};

export default Layout;

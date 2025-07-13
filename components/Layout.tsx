import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useSidebar } from "../contexts/SidebarContext";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showSidebar && <Sidebar />}

      {/* Contenu principal avec marge adaptative */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showSidebar ? (isExpanded ? "ml-64" : "ml-16") : "ml-0"
        }`}
      >
        <Navbar showSidebar={showSidebar} />
        <main className="pt-16">{children}</main>
      </div>
      {/* Footer global */}
      <div className={showSidebar ? (isExpanded ? "ml-64" : "ml-16") : "ml-0"}>
        {/* On affiche le footer en dehors du main pour qu'il soit toujours visible */}
        {<Footer />}
      </div>
    </div>
  );
};

export default Layout;

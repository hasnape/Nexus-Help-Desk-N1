import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";
import { Button } from "./FormElements";
import { useSidebar } from "../contexts/SidebarContext";
import Logo from "./Logo";

interface NavbarProps {
  showSidebar?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showSidebar = true }) => {
  const { user, logout } = useApp();
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClasses = showSidebar
    ? `transition-all duration-300 ${isExpanded ? "left-64" : "left-16"}`
    : "left-0";

  return (
    <nav
      className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 right-0 z-30 ${navClasses}`}
      aria-label="Barre de navigation principale"
      role="navigation"
    >
      <div className="px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="w-2 sm:w-8"></div>

          <div className="flex justify-center flex-1">
            <Link
              to={user ? "/dashboard" : "/"}
              className="hover:opacity-80 transition-opacity"
              aria-label="Accueil Nexus Help Desk"
              tabIndex={0}
            >
              <div className="flex items-center">
                <div className="block sm:hidden">
                  <Logo size="lg" showText={false} />
                </div>
                <div className="hidden sm:block">
                  <Logo size="md" showText={true} />
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span
                  className="text-xs sm:text-sm text-gray-700 truncate max-w-20 sm:max-w-none"
                  aria-label="Nom de l'utilisateur connecté"
                >
                  {user.full_name}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                  aria-label="Se déconnecter"
                  tabIndex={0}
                >
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                    aria-label="Se connecter"
                    tabIndex={0}
                  >
                    Se connecter
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                    aria-label="S'inscrire"
                    tabIndex={0}
                  >
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

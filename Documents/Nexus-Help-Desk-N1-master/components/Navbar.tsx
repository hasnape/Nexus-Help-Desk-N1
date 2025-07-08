import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";
import { Button } from "./FormElements";
import { useLanguage, Locale } from "../contexts/LanguageContext";
import { useSidebar } from "../contexts/SidebarContext";
import Logo from "./Logo";

const Navbar: React.FC = () => {
  const { user, logout } = useApp();
  const { language, setLanguage } = useLanguage();
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const languages: { code: Locale; nameKey: string; defaultName: string }[] = [
    { code: "en", nameKey: "language.english", defaultName: "English" },
    { code: "fr", nameKey: "language.french", defaultName: "Français" },
    { code: "ar", nameKey: "language.arabic", defaultName: "العربية" },
  ];

  return (
    <nav
      className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${
        isExpanded ? "left-64" : "left-16"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Espace vide à gauche */}
          <div className="w-8"></div>

          {/* Logo au centre */}
          <div className="flex justify-center flex-1">
            <Link
              to={user ? "/dashboard" : "/"}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo size="md" />
            </Link>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {/* Menu Langue */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {language.toUpperCase()}
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {lang.defaultName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <div className="hidden sm:block text-gray-700 text-sm">
                  Bonjour, {user.full_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="!text-gray-700 !border-gray-300 hover:!bg-gray-50"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="!bg-blue-600 hover:!bg-blue-700"
                  >
                    Inscription
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

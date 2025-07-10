import React, { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";
import { Button } from "./FormElements";
import { Locale } from "../contexts/LanguageContext";
import { useSidebar } from "../contexts/SidebarContext";
import Logo from "./Logo";
import LoadingSpinner from "./LoadingSpinner";

interface NavbarProps {
  showSidebar?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showSidebar = true }) => {
  const { user, logout } = useApp();
  const { t, i18n } = useTranslation(["common", "components"]);
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  const languages: { code: Locale; nameKey: string; defaultName: string }[] = [
    { code: "en", nameKey: "language.english", defaultName: "English" },
    { code: "fr", nameKey: "language.french", defaultName: "Français" },
    { code: "ar", nameKey: "language.arabic", defaultName: "العربية" },
  ];

  const navClasses = showSidebar
    ? `transition-all duration-300 ${isExpanded ? "left-64" : "left-16"}`
    : "left-0";

  return (
    <Suspense fallback={<div className="h-16 bg-white border-b" />}>
      <nav
        className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 right-0 z-30 ${navClasses}`}
      >
        <div className="px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="w-2 sm:w-8"></div>

            <div className="flex justify-center flex-1">
              <Link
                to={user ? "/dashboard" : "/"}
                className="hover:opacity-80 transition-opacity"
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
              {/* Language Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title={t("language.current", { ns: "common" })}
                >
                  {i18n.language.toUpperCase()}
                </button>

                {isLanguageMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 sm:w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1 sm:py-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`block w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                            i18n.language === lang.code
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {t(lang.nameKey, {
                            ns: "common",
                            defaultValue: lang.defaultName,
                          })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <>
                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-700 truncate max-w-20 sm:max-w-none">
                      {user.full_name}
                    </span>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                    >
                      {t("navigation.logout", { ns: "common" })}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                    >
                      {t("actions.login", {
                        ns: "auth",
                        defaultValue: "Se connecter",
                      })}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs sm:text-sm !px-2 sm:!px-3 !py-1 sm:!py-2"
                    >
                      {t("actions.signUp", {
                        ns: "auth",
                        defaultValue: "S'inscrire",
                      })}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close language menu when clicking outside */}
        {isLanguageMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsLanguageMenuOpen(false)}
          />
        )}
      </nav>
    </Suspense>
  );
};

export default Navbar;

import React, { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../App";
import { useSidebarSafe } from "../contexts/SidebarContext";
import LoadingSpinner from "./LoadingSpinner";

const SidebarContent: React.FC = () => {
  const { t } = useTranslation(["components", "common"]);
  const { user } = useApp();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebarSafe();

  // Toutes les pages organisées par catégories
  const menuItems = [
    {
      category: t("components.sidebar.categories.main"),
      items: [
        {
          path: "/",
          label: t("components.sidebar.items.home"),
          icon: "🏠",
          public: true,
        },
        {
          path: "/contact",
          label: t("components.sidebar.items.contact"),
          icon: "📞",
          public: true,
        },
        {
          path: "/promotional",
          label: t("components.sidebar.items.promotions"),
          icon: "🎉",
          public: true,
        },
        {
          path: "/subscription",
          label: t("components.sidebar.items.subscription"),
          icon: "💎",
          public: true,
        },
      ],
    },
    {
      category: t("components.sidebar.categories.information"),
      items: [
        {
          path: "/user-manual",
          label: t("components.sidebar.items.userManual"),
          icon: "📖",
          public: true,
        },
        {
          path: "/legal",
          label: t("components.sidebar.items.legal"),
          icon: "⚖️",
          public: true,
        },
      ],
    },
    {
      category: t("components.sidebar.categories.authentication"),
      items: [
        {
          path: "/login",
          label: t("components.sidebar.items.login"),
          icon: "🔑",
          public: true,
          authOnly: true,
        },
        {
          path: "/signup",
          label: t("components.sidebar.items.signup"),
          icon: "✨",
          public: true,
          authOnly: true,
        },
      ],
    },
    {
      category: t("components.sidebar.categories.mySpace"),
      items: [
        {
          path: "/dashboard",
          label: t("components.sidebar.items.dashboard"),
          icon: "📊",
          requireAuth: true,
        },
        {
          path: "/new-ticket",
          label: t("components.sidebar.items.newTicket"),
          icon: "🎫",
          requireAuth: true,
        },
        {
          path: "/help-chat",
          label: t("components.sidebar.items.helpChat"),
          icon: "💬",
          requireAuth: true,
        },
        {
          path: "/tickets",
          label: t("components.sidebar.items.myTickets"),
          icon: "📋",
          requireAuth: true,
        },
      ],
    },
    {
      category: t("components.sidebar.categories.administration"),
      items: [
        {
          path: "/agent-dashboard",
          label: t("components.sidebar.items.agentDashboard"),
          icon: "👤",
          requireRole: ["agent", "manager"],
        },
        {
          path: "/manager-dashboard",
          label: t("components.sidebar.items.managerDashboard"),
          icon: "👨‍💼",
          requireRole: ["manager"],
        },
        {
          path: "/new-user",
          label: t("components.sidebar.items.newUser"),
          icon: "👥",
          requireRole: ["manager"],
        },
        {
          path: "/ticket-detail",
          label: t("components.sidebar.items.ticketDetail"),
          icon: "🔍",
          requireRole: ["agent", "manager"],
        },
      ],
    },
  ];

  // Fonction pour vérifier si un item doit être affiché
  const shouldShowItem = (item: any) => {
    if (item.public && !item.authOnly) return true;
    if (item.authOnly && !user) return true;
    if (item.requireAuth && user) return true;
    if (item.requireRole && user && item.requireRole.includes(user.role))
      return true;
    return false;
  };

  return (
    <>
      {/* Sidebar avec fond gris foncé */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 z-40 ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Header avec bouton toggle */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            title={
              isExpanded
                ? t("components.sidebar.collapse")
                : t("components.sidebar.expand")
            }
          >
            {isExpanded ? "◀️" : "▶️"}
          </button>
        </div>

        {/* Menu de navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((category) => {
            const visibleItems = category.items.filter(shouldShowItem);
            if (visibleItems.length === 0) return null;

            return (
              <div key={category.category} className="mb-4">
                {isExpanded && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {category.category}
                    </h3>
                  </div>
                )}

                <nav className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`}
                        title={!isExpanded ? item.label : ""}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {isExpanded && (
                          <span className="ml-3 truncate">{item.label}</span>
                        )}
                        {isActive && isExpanded && (
                          <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}

          {/* Liens rapides vers les sections de la landing */}
          {isExpanded && (
            <div className="mb-4">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t("components.sidebar.quickLinks.title")}
                </h3>
              </div>
              <nav className="space-y-1">
                <a
                  href="#features"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">⚡</span>
                  <span className="ml-3">
                    {t("components.sidebar.quickLinks.features")}
                  </span>
                </a>
                <a
                  href="#pricing"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">💰</span>
                  <span className="ml-3">
                    {t("components.sidebar.quickLinks.pricing")}
                  </span>
                </a>
                <a
                  href="#contact"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">📞</span>
                  <span className="ml-3">
                    {t("components.sidebar.quickLinks.contact")}
                  </span>
                </a>
              </nav>
            </div>
          )}
        </div>

        {/* Footer du sidebar */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 text-center">
              {t("components.sidebar.footer")}
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour mobile quand sidebar ouverte */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

const Sidebar: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SidebarContent />
    </Suspense>
  );
};

export default Sidebar;

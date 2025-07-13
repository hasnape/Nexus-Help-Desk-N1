import React, { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../App";
import { useSidebarSafe } from "../contexts/SidebarContext";
import LoadingSpinner from "./LoadingSpinner";

const SidebarContent: React.FC = () => {
  const { t } = useTranslation("components");
  const { user } = useApp();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebarSafe();

  // Typage des items pour plus de robustesse
  type SidebarItem = {
    path: string;
    label: string;
    icon: string;
    public?: boolean;
    authOnly?: boolean;
    requireAuth?: boolean;
    requireRole?: string[];
  };

  type SidebarCategory = {
    category: string;
    items: SidebarItem[];
  };

  // Définition des items (optimisé)
  const menuItems: SidebarCategory[] = [
    {
      category: t("sidebar.categories.main"),
      items: [
        { path: "/", label: t("sidebar.items.home"), icon: "🏠", public: true },
        {
          path: "/contact",
          label: t("sidebar.items.contact"),
          icon: "📞",
          public: true,
        },
        {
          path: "/promotional",
          label: t("sidebar.items.promotions"),
          icon: "🎉",
          public: true,
        },
        {
          path: "/subscription",
          label: t("sidebar.items.subscription"),
          icon: "💎",
          public: true,
        },
      ],
    },
    {
      category: t("sidebar.categories.information"),
      items: [
        {
          path: "/user-manual",
          label: t("sidebar.items.userManual"),
          icon: "📖",
          public: true,
        },
        {
          path: "/legal",
          label: t("sidebar.items.legal"),
          icon: "⚖️",
          public: true,
        },
      ],
    },
    {
      category: t("sidebar.categories.authentication"),
      items: [
        {
          path: "/login",
          label: t("sidebar.items.login"),
          icon: "🔑",
          public: true,
          authOnly: true,
        },
        {
          path: "/signup",
          label: t("sidebar.items.signup"),
          icon: "✨",
          public: true,
          authOnly: true,
        },
      ],
    },
    {
      category: t("sidebar.categories.mySpace"),
      items: [
        {
          path: "/dashboard",
          label: t("sidebar.items.dashboard"),
          icon: "📊",
          requireAuth: true,
        },
        {
          path: "/new-ticket",
          label: t("sidebar.items.newTicket"),
          icon: "🎫",
          requireAuth: true,
        },
        {
          path: "/help-chat",
          label: t("sidebar.items.helpChat"),
          icon: "💬",
          requireAuth: true,
        },
        {
          path: "/tickets",
          label: t("sidebar.items.myTickets"),
          icon: "📋",
          requireAuth: true,
        },
      ],
    },
    {
      category: t("sidebar.categories.administration"),
      items: [
        {
          path: "/agent-dashboard",
          label: t("sidebar.items.agentDashboard"),
          icon: "👤",
          requireRole: ["agent", "manager"],
        },
        {
          path: "/manager-dashboard",
          label: t("sidebar.items.managerDashboard"),
          icon: "👨‍💼",
          requireRole: ["manager"],
        },
        {
          path: "/new-user",
          label: t("sidebar.items.newUser"),
          icon: "👥",
          requireRole: ["manager"],
        },
        {
          path: "/ticket-detail",
          label: t("sidebar.items.ticketDetail"),
          icon: "🔍",
          requireRole: ["agent", "manager"],
        },
      ],
    },
  ];

  // Fonction optimisée pour vérifier si un item doit être affiché
  const shouldShowItem = (item: SidebarItem): boolean => {
    if (item.public && !item.authOnly) return true;
    if (item.authOnly && !user) return true;
    if (item.requireAuth && !!user) return true;
    if (item.requireRole && user && item.requireRole.includes(user.role))
      return true;
    return false;
  };

  return (
    <>
      {/* Sidebar avec fond gris foncé et navigation accessible */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 z-40 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        aria-label={t("sidebar.ariaLabel", "Menu latéral")}
        role="navigation"
      >
        {/* Header avec bouton toggle accessible */}
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            title={isExpanded ? t("sidebar.collapse") : t("sidebar.expand")}
            aria-label={
              isExpanded ? t("sidebar.collapse") : t("sidebar.expand")
            }
            tabIndex={0}
          >
            {isExpanded ? "◀️" : "▶️"}
          </button>
        </div>

        {/* Menu de navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4"
          aria-label={t("sidebar.ariaNav", "Navigation principale")}
        >
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

                <ul className="space-y-1" role="menu">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path} role="none">
                        <Link
                          to={item.path}
                          className={`flex items-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-lg"
                              : "text-gray-300 hover:text-white hover:bg-gray-700"
                          }`}
                          title={!isExpanded ? item.label : ""}
                          aria-label={item.label}
                          role="menuitem"
                          tabIndex={0}
                        >
                          <span className="text-lg" aria-hidden="true">
                            {item.icon}
                          </span>
                          {isExpanded && (
                            <span className="ml-3 truncate">{item.label}</span>
                          )}
                          {isActive && isExpanded && (
                            <span
                              className="ml-auto w-2 h-2 bg-white rounded-full"
                              aria-label={t("sidebar.activeIndicator", "Actif")}
                            ></span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {/* Liens rapides vers les sections de la landing */}
          {isExpanded && (
            <div className="mb-4">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t("sidebar.quickLinks.title")}
                </h3>
              </div>
              <ul className="space-y-1" role="menu">
                <li role="none">
                  <a
                    href="#features"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("sidebar.quickLinks.features")}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      ⚡
                    </span>
                    <span className="ml-3">
                      {t("sidebar.quickLinks.features")}
                    </span>
                  </a>
                </li>
                <li role="none">
                  <a
                    href="#pricing"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("sidebar.quickLinks.pricing")}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      💰
                    </span>
                    <span className="ml-3">
                      {t("sidebar.quickLinks.pricing")}
                    </span>
                  </a>
                </li>
                <li role="none">
                  <a
                    href="#contact"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("sidebar.quickLinks.contact")}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      📞
                    </span>
                    <span className="ml-3">
                      {t("sidebar.quickLinks.contact")}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Footer du sidebar accessible */}
        {isExpanded && (
          <footer
            className="p-4 border-t border-gray-700"
            aria-label={t("sidebar.footerAria", "Informations complémentaires")}
          >
            <div className="text-xs text-gray-400 text-center">
              {t("sidebar.footer")}
            </div>
          </footer>
        )}
      </aside>

      {/* Overlay pour mobile quand sidebar ouverte */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-label={t("sidebar.overlayAria", "Fermer le menu latéral")}
          tabIndex={0}
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

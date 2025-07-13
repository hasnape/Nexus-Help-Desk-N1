import React, { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";
import { useSidebarSafe } from "../contexts/SidebarContext";
import LoadingSpinner from "./LoadingSpinner";

const SidebarContent: React.FC = () => {
  const { user } = useApp();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebarSafe();

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

  const menuItems: SidebarCategory[] = [
    {
      category: "Menu principal",
      items: [
        { path: "/", label: "Accueil", icon: "🏠", public: true },
        { path: "/contact", label: "Contact", icon: "📞", public: true },
        { path: "/promotional", label: "Promotions", icon: "🎉", public: true },
        {
          path: "/subscription",
          label: "Abonnement",
          icon: "💎",
          public: true,
        },
      ],
    },
    {
      category: "Informations",
      items: [
        {
          path: "/user-manual",
          label: "Manuel utilisateur",
          icon: "📖",
          public: true,
        },
        { path: "/legal", label: "Mentions légales", icon: "⚖️", public: true },
      ],
    },
    {
      category: "Authentification",
      items: [
        {
          path: "/login",
          label: "Connexion",
          icon: "🔑",
          public: true,
          authOnly: true,
        },
        {
          path: "/signup",
          label: "Inscription",
          icon: "✨",
          public: true,
          authOnly: true,
        },
      ],
    },
    {
      category: "Mon espace",
      items: [
        {
          path: "/dashboard",
          label: "Tableau de bord",
          icon: "📊",
          requireAuth: true,
        },
        {
          path: "/new-ticket",
          label: "Nouveau ticket",
          icon: "🎫",
          requireAuth: true,
        },
        {
          path: "/help-chat",
          label: "Chat d'aide",
          icon: "💬",
          requireAuth: true,
        },
        {
          path: "/tickets",
          label: "Mes tickets",
          icon: "📋",
          requireAuth: true,
        },
      ],
    },
    {
      category: "Administration",
      items: [
        {
          path: "/agent-dashboard",
          label: "Espace agent",
          icon: "👤",
          requireRole: ["agent", "manager"],
        },
        {
          path: "/manager-dashboard",
          label: "Espace manager",
          icon: "👨‍💼",
          requireRole: ["manager"],
        },
        {
          path: "/new-user",
          label: "Nouvel utilisateur",
          icon: "👥",
          requireRole: ["manager"],
        },
        {
          path: "/ticket-detail",
          label: "Détail ticket",
          icon: "🔍",
          requireRole: ["agent", "manager"],
        },
      ],
    },
  ];

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
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 z-40 ${
          isExpanded ? "w-64" : "w-16"
        }`}
        aria-label="Menu latéral"
        role="navigation"
      >
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            title={isExpanded ? "Réduire" : "Déployer"}
            aria-label={isExpanded ? "Réduire" : "Déployer"}
            tabIndex={0}
          >
            {isExpanded ? "◀️" : "▶️"}
          </button>
        </div>
        <nav
          className="flex-1 overflow-y-auto py-4"
          aria-label="Navigation principale"
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
                              aria-label="Actif"
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
                  Liens rapides
                </h3>
              </div>
              <ul className="space-y-1" role="menu">
                <li role="none">
                  <Link
                    to="/#features"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Fonctionnalités"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      ⚡
                    </span>
                    <span className="ml-3">Fonctionnalités</span>
                  </Link>
                </li>
                <li role="none">
                  <a
                    href="#pricing"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Tarifs"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      💰
                    </span>
                    <span className="ml-3">Tarifs</span>
                  </a>
                </li>
                <li role="none">
                  <a
                    href="#contact"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Contact"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg" aria-hidden="true">
                      📞
                    </span>
                    <span className="ml-3">Contact</span>
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
            aria-label="Informations complémentaires"
          >
            <div className="text-xs text-gray-400 text-center">
              © 2025 Nexus Help Desk. Tous droits réservés.
            </div>
          </footer>
        )}
      </aside>
      {/* Overlay pour mobile quand sidebar ouverte */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Fermer le menu latéral"
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

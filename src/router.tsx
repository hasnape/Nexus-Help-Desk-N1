// src/router.tsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";

import LoadingSpinner from "@/components/LoadingSpinner";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import PageLayout from "@/components/PageLayout";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import LegalPage from "@/pages/LegalPage";
import UserManualPage from "@/pages/UserManualPage";
import PromotionalPage from "@/pages/PromotionalPage";
import ContactPage from "@/pages/ContactPage";
import AboutPage from "@/pages/AboutPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import PartnersPage from "@/pages/PartnersPage";
import InfographiePage from "@/pages/InfographiePage";
import PricingPage from "@/pages/PricingPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import DashboardPage from "@/pages/DashboardPage";
import HelpChatPage from "@/pages/HelpChatPage";
import NewTicketPage from "@/pages/NewTicketPage";
import TicketDetailPage from "@/pages/TicketDetailPage";
import AgentDashboardPage from "@/pages/AgentDashboardPage";
import ManagerDashboardPage from "@/pages/ManagerDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AccessibilitePage from "@/pages/AccessibilitePage";
import DemoPage from "@/pages/DemoPage";

// Chemins sans chrome ou avec layout spécial
const noLayoutPaths = new Set(["/landing", "/login", "/signup"]);
const specialLayoutPaths = new Set([
  "/legal",
  "/manual",
  "/presentation",
  "/contact",
  "/about",
  "/testimonials",
  "/partners",
  "/infographie",
  "/accessibilite",
]);

function assertElement(el: React.ReactNode, name: string) {
  if (el === undefined || el === null) {
    throw new Error(
      `Route element for "${name}" is undefined/null. Vérifie l'import: la page ${name} existe-t-elle et l'import est-il correct ?`
    );
  }
  return el;
}

type RouteLike = {
  path?: string;
  element?: React.ReactNode;
  Component?: React.ComponentType<any>;
  lazy?: unknown;
  children?: RouteLike[];
  index?: boolean;
};

function validateRoutes(routes: RouteLike[], trail = "root") {
  for (const route of routes) {
    const where = `${trail}${route.path ? " > " + route.path : route.index ? " > (index)" : ""}`;
    const flags = ["element", "Component", "lazy"].filter((key) => (route as any)[key] != null);
    if (flags.length > 1) {
      throw new Error(
        `Invalid route at ${where}: mixe ${flags.join(
          " + "
        )}. Utilise soit "element", soit "Component", soit "lazy", mais pas plusieurs.`
      );
    }
    if (route.children) {
      validateRoutes(route.children, where);
    }
  }
}

// Layout racine conscient du consentement + du chrome
const AppLayout: React.FC = () => {
  const { isLoading, consentGiven, giveConsent } = useApp();
  const { isLoadingLang, t } = useLanguage();
  const location = useLocation();

  if (isLoading || isLoadingLang) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <LoadingSpinner size="lg" text={`${t("appName")}...`} />
      </div>
    );
  }

  const pathname = location.pathname;
  const skipLayout = specialLayoutPaths.has(pathname);
  const skipChrome = noLayoutPaths.has(pathname);
  const outlet = <Outlet />;
  const contentWithConsent = (
    <>
      {outlet}
      {!skipLayout && !consentGiven && <CookieConsentBanner onAccept={giveConsent} />}
    </>
  );

  if (skipLayout) return outlet;
  if (skipChrome) return contentWithConsent;

  return <PageLayout>{contentWithConsent}</PageLayout>;
};

// Redirection racine selon rôle
const RootRedirect: React.FC = () => {
  const { user } = useApp();

  if (!user) return <Navigate to="/landing" replace />;

  if (user.role === UserRole.AGENT) return <Navigate to="/agent/dashboard" replace />;
  if (user.role === UserRole.MANAGER) return <Navigate to="/manager/dashboard" replace />;

  return <Navigate to="/dashboard" replace />;
};

// Garde de route
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useApp();
  const location = useLocation();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target =
      user.role === UserRole.AGENT
        ? "/agent/dashboard"
        : user.role === UserRole.MANAGER
        ? "/manager/dashboard"
        : "/dashboard";
    return <Navigate to={target} replace />;
  }
  return children;
};

/**
 * Aliases / redirections de compatibilité :
 * - /help-chat        -> /help
 * - /tickets/new      -> /ticket/new
 * - /tickets/:id      -> /ticket/:id
 */
const HelpChatAlias: React.FC = () => <Navigate to="/help" replace />;

const TicketsNewAlias: React.FC = () => <Navigate to="/ticket/new" replace />;

const TicketsIdAlias: React.FC = () => {
  const { id } = useParams();
  return <Navigate to={`/ticket/${id ?? ""}`} replace />;
};

const routes: RouteLike[] = [
  {
    path: "/",
    element: <AppLayout />,
    // En cas d'erreur de routing non interceptée
    children: [
      { index: true, element: assertElement(<RootRedirect />, "RootRedirect") },

      // Public / marketing
      { path: "landing", element: assertElement(<LandingPage />, "LandingPage") },
      { path: "login", element: assertElement(<LoginPage />, "LoginPage") },
      { path: "signup", element: assertElement(<SignUpPage />, "SignUpPage") },
      { path: "legal", element: assertElement(<LegalPage />, "LegalPage") },
      { path: "manual", element: assertElement(<UserManualPage />, "UserManualPage") },
      { path: "presentation", element: assertElement(<PromotionalPage />, "PromotionalPage") },
      { path: "contact", element: assertElement(<ContactPage />, "ContactPage") },
      { path: "about", element: assertElement(<AboutPage />, "AboutPage") },
      { path: "testimonials", element: assertElement(<TestimonialsPage />, "TestimonialsPage") },
      { path: "partners", element: assertElement(<PartnersPage />, "PartnersPage") },
      { path: "infographie", element: assertElement(<InfographiePage />, "InfographiePage") },
      { path: "accessibilite", element: assertElement(<AccessibilitePage />, "AccessibilitePage") },
      { path: "pricing", element: assertElement(<PricingPage />, "PricingPage") },
      { path: "demo", element: assertElement(<DemoPage />, "DemoPage") },

      // Abonnement (protégé)
      {
        path: "subscribe",
        element: assertElement(
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>,
          "SubscriptionPage"
        ),
      },

      // Tableaux de bord (protégés)
      {
        path: "dashboard",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            <DashboardPage />
          </ProtectedRoute>,
          "DashboardPage"
        ),
      },
      {
        path: "agent/dashboard",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.MANAGER]}>
            <AgentDashboardPage />
          </ProtectedRoute>,
          "AgentDashboardPage"
        ),
      },
      {
        path: "manager/dashboard",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
            <ManagerDashboardPage />
          </ProtectedRoute>,
          "ManagerDashboardPage"
        ),
      },

      // Help chat (protégé) + alias
      {
        path: "help",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            <HelpChatPage />
          </ProtectedRoute>,
          "HelpChatPage"
        ),
      },
      { path: "help-chat", element: <HelpChatAlias /> }, // compat

      // Création ticket (protégé) + alias
      {
        path: "ticket/new",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT]}>
            <NewTicketPage />
          </ProtectedRoute>,
          "NewTicketPage"
        ),
      },
      { path: "tickets/new", element: <TicketsNewAlias /> }, // compat

      // Détail ticket (protégé) + alias
      {
        path: "ticket/:id",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            <TicketDetailPage />
          </ProtectedRoute>,
          "TicketDetailPage"
        ),
      },
      { path: "tickets/:id", element: <TicketsIdAlias /> }, // compat

      // 404
      { path: "*", element: assertElement(<NotFoundPage />, "NotFoundPage") },
    ],
  },
];

validateRoutes(routes);

export const router = createBrowserRouter(routes as any);

export function AppRouter() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={<div style={{ padding: 24 }}>Chargement du routeur…</div>}
      // page d'erreur globale pour erreurs de routing runtime
      future={{ v7_startTransition: true }}
    />
  );
}

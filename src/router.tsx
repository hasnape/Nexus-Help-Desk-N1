import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  RouteObject,
  useLocation,
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
import ErrorPage from "@/pages/ErrorPage";

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
]);

function assertElement(el: React.ReactNode, name: string) {
  if (el === undefined || el === null) {
    throw new Error(
      `Route element for "${name}" is undefined/null. Vérifie l'import: la page ${name} existe-t-elle et l'import est-il correct ?`
    );
  }
  return el;
}

function validateRoutes(routes: RouteObject[], trail = "root") {
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

const RootLayout: React.FC = () => {
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

  if (skipLayout) {
    return outlet;
  }

  if (skipChrome) {
    return contentWithConsent;
  }

  return <PageLayout>{contentWithConsent}</PageLayout>;
};

const RootRedirect: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (user.role === UserRole.AGENT) {
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (user.role === UserRole.MANAGER) {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useApp();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

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

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: assertElement(<RootRedirect />, "RootRedirect") },
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
      { path: "pricing", element: assertElement(<PricingPage />, "PricingPage") },
      {
        path: "subscribe",
        element: assertElement(
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>,
          "SubscriptionPage"
        ),
      },
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
        path: "help-chat",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            <HelpChatPage />
          </ProtectedRoute>,
          "HelpChatPage"
        ),
      },
      {
        path: "tickets/new",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT]}>
            <NewTicketPage />
          </ProtectedRoute>,
          "NewTicketPage"
        ),
      },
      {
        path: "tickets/:id",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.AGENT, UserRole.MANAGER]}>
            <TicketDetailPage />
          </ProtectedRoute>,
          "TicketDetailPage"
        ),
      },
      {
        path: "agent/dashboard",
        element: assertElement(
          <ProtectedRoute allowedRoles={[UserRole.AGENT]}>
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
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

validateRoutes(routes);

const router = createBrowserRouter(routes);

export function AppRouter() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={<div style={{ padding: 24 }}>Chargement du routeur…</div>}
    />
  );
}

export { router };

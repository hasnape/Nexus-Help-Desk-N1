import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NexusInfographic from "../components/NexusInfographic";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

const LandingPage: React.FC = () => {
  const { t } = useTranslation(["landing", "pricing", "common"]);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleWatchDemo = () => {
    window.open("https://youtu.be/OnfUuaRlukQ?si=DaIZ6gI9LF1aVzoe", "_blank");
  };

  const features = [
    {
      title: t("features.ai.title"),
      description: t("features.ai.desc"),
      icon: "🤖",
    },
    {
      title: t("features.secure.title"),
      description: t("features.secure.desc"),
      icon: "🏢",
    },
    {
      title: t("features.multilingual.title"),
      description: t("features.multilingual.desc"),
      icon: "🌐",
    },
    {
      title: t("features.dashboards.title"),
      description: t("features.dashboards.desc"),
      icon: "📊",
    },
  ];

  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Layout>
        {/* Hero Section */}
        <section id="home" className="bg-gray-800 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
              >
                {t("hero.ctaButton")}
              </button>
              <button
                onClick={handleWatchDemo}
                className="border-2 border-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-600 hover:text-white transition-colors"
              >
                {t("hero.demoButton")}
              </button>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="py-8 sm:py-12 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("ai.title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("ai.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">
                          💬
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {t("ai.chatTitle")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {t("ai.chatDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">
                          🎫
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {t("ai.ticketCreationTitle")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {t("ai.ticketCreationDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm sm:text-base">
                          👥
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {t("ai.smartAssignmentTitle")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {t("ai.smartAssignmentDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  {t("ai.exampleTicketTitle")}
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <span className="font-semibold text-blue-600">
                      {t("ai.ticketNumber")}
                    </span>
                    <span className="float-right text-gray-500 text-xs">
                      {t("ai.createdByAI")}
                    </span>
                  </div>
                  <p className="mb-2">
                    <span className="font-semibold">{t("ai.userLabel")}</span>{" "}
                    Marie Dupont
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">{t("ai.titleLabel")}</span>{" "}
                    Impossible de se connecter à l'application
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">
                      {t("ai.categoryLabel")}
                    </span>{" "}
                    Technique (suggérée par IA)
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">
                      {t("ai.priorityLabel")}
                    </span>{" "}
                    Moyenne (suggérée par IA)
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">
                      {t("ai.conversationHistoryLabel")}
                    </span>
                  </p>
                  <div className="bg-white rounded p-2 mb-2 text-xs">
                    <p className="mb-1">
                      <strong>{t("ai.userLabel")}</strong> Je n'arrive pas à me
                      connecter
                    </p>
                    <p className="mb-1">
                      <strong>{t("ai.aiLabel")}</strong> Avez-vous essayé de
                      réinitialiser votre mot de passe ?
                    </p>
                    <p className="mb-1">
                      <strong>{t("ai.userLabel")}</strong> Oui, mais ça ne
                      fonctionne toujours pas
                    </p>
                    <p>
                      <strong>{t("ai.aiLabel")}</strong> Je vais créer un ticket
                      pour qu'un agent vous aide...
                    </p>
                  </div>
                  <p>
                    <span className="font-semibold">{t("ai.statusLabel")}</span>{" "}
                    Ouvert - En attente d'assignation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("demo.title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("demo.subtitle")}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" /* 16:9 */ }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                  src="https://www.youtube.com/embed/OnfUuaRlukQ"
                  title={t("demo.title")}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="text-center mt-4 sm:mt-6">
                <button
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors"
                >
                  {t("demo.ctaButton")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-8 sm:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("features.title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Infographic Section */}
        <NexusInfographic />

        {/* Pricing Section */}
        <section id="pricing" className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("pricing.title")}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("pricing.subtitle")}
              </p>
            </div>
            <div className="mt-16 grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Freemium */}
              <div className="border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl border-slate-200 shadow-lg">
                <div className="mx-auto mb-4">
                  <FreemiumPlanIcon className="w-12 h-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {t("pricing:freemium.name")}
                </h3>
                <p className="mt-2 text-slate-500 flex-grow">
                  {t("pricing:freemium.desc")}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    {t("pricing:freemium.price")}
                  </span>
                  <span className="text-slate-500 ms-1">
                    {t("pricing:perAgentPerMonth")}
                  </span>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                  {/* Freemium */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-center justify-center">
                      <div className="flex-shrink-0 text-green-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="ms-3 text-slate-600">
                        {t(`pricing:freemium.feature${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a className="block w-full" href="/signup?plan=freemium">
                    <button className="font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 flex items-center justify-center px-6 py-3 text-base bg-primary hover:bg-primary-dark text-white focus:ring-primary w-full">
                      {t("pricing:freemium.ctaButton", {
                        default: "Commencer gratuitement",
                      })}
                    </button>
                  </a>
                </div>
              </div>

              {/* Standard */}
              <div className="border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl border-primary shadow-xl">
                <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full self-center mb-4">
                  {t("pricing:popularLabel")}
                </span>
                <div className="mx-auto mb-4">
                  <StandardPlanIcon className="w-12 h-12 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {t("pricing:standard.name")}
                </h3>
                <p className="mt-2 text-slate-500 flex-grow">
                  {t("pricing:standard.desc")}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    {t("pricing:standard.price")}
                  </span>
                  <span className="text-slate-500 ms-1">
                    {t("pricing:perAgentPerMonth")}
                  </span>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                  {/* Standard */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-center justify-center">
                      <div className="flex-shrink-0 text-green-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="ms-3 text-slate-600">
                        {t(`pricing:standard.feature${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a className="block w-full" href="/signup?plan=standard">
                    <button className="font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 flex items-center justify-center px-6 py-3 text-base bg-primary hover:bg-primary-dark text-white focus:ring-primary w-full">
                      {t("pricing:standard.ctaButton", {
                        default: "Choisir ce plan",
                      })}
                    </button>
                  </a>
                </div>
              </div>

              {/* Pro */}
              <div className="border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl border-slate-200 shadow-lg">
                <div className="mx-auto mb-4">
                  <ProPlanIcon className="w-12 h-12 text-amber-500 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {t("pricing:pro.name")}
                </h3>
                <p className="mt-2 text-slate-500 flex-grow">
                  {t("pricing:pro.desc")}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    {t("pricing:pro.price")}
                  </span>
                  <span className="text-slate-500 ms-1">
                    {t("pricing:perAgentPerMonth")}
                  </span>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                  {/* Pro */}
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-center justify-center">
                      <div className="flex-shrink-0 text-green-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="ms-3 text-slate-600">
                        {t(`pricing:pro.feature${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a className="block w-full" href="/signup?plan=pro">
                    <button className="font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 flex items-center justify-center px-6 py-3 text-base bg-primary hover:bg-primary-dark text-white focus:ring-primary w-full shadow-md">
                      {t("pricing:pro.ctaButton", {
                        default: "Choisir ce plan",
                      })}
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </Suspense>
  );
};

export default LandingPage;

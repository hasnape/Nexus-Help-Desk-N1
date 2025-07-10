import React, { Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NexusInfographic from "../components/NexusInfographic";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

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

  const plans = [
    {
      name: t("pricing:freemium.name"),
      price: t("pricing:freemium.price"),
      description: t("pricing:freemium.desc"),
      features: [
        "🎁 " + t("pricing:freemium.feature1"),
        "🎁 " + t("pricing:freemium.feature2"),
        "🎁 " + t("pricing:freemium.feature3"),
        "🎁 " + t("pricing:freemium.feature4"),
        "🎁 " + t("pricing:freemium.feature5"),
      ],
      popular: false,
      icon: "🆓",
      badge: t("pricing:freemium.badge"),
    },
    {
      name: t("pricing:standard.name"),
      price: t("pricing:standard.price") + t("pricing:perAgentPerMonth"),
      originalPrice: t("pricing:standard.originalPrice"),
      description: t("pricing:standard.desc"),
      features: [
        "🚀 " + t("pricing:standard.feature1"),
        "🚀 " + t("pricing:standard.feature2"),
        t("pricing:standard.feature3"),
        t("pricing:standard.feature4"),
        t("pricing:standard.feature5"),
      ],
      popular: true,
      icon: "⚡",
      badge: t("pricing:standard.badge"),
    },
    {
      name: t("pricing:pro.name"),
      price: t("pricing:pro.price") + t("pricing:perAgentPerMonth"),
      originalPrice: t("pricing:pro.originalPrice"),
      description: t("pricing:pro.desc"),
      features: [
        t("pricing:pro.feature1"),
        "🤖 " + t("pricing:pro.feature2"),
        t("pricing:pro.feature3"),
        t("pricing:pro.feature4"),
      ],
      popular: false,
      icon: "🚀",
      badge: t("pricing:pro.badge"),
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
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-colors"
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
                    <span className="font-semibold">
                      {t("ai.userLabel")}
                    </span>{" "}
                    Marie Dupont
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">
                      {t("ai.titleLabel")}
                    </span>{" "}
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
                      <strong>
                        {t("ai.userLabel")}
                      </strong>{" "}
                      Je n'arrive pas à me connecter
                    </p>
                    <p className="mb-1">
                      <strong>
                        {t("ai.aiLabel")}
                      </strong>{" "}
                      Avez-vous essayé de réinitialiser votre mot de passe ?
                    </p>
                    <p className="mb-1">
                      <strong>
                        {t("ai.userLabel")}
                      </strong>{" "}
                      Oui, mais ça ne fonctionne toujours pas
                    </p>
                    <p>
                      <strong>
                        {t("ai.aiLabel")}
                      </strong>{" "}
                      Je vais créer un ticket pour qu'un agent vous aide...
                    </p>
                  </div>
                  <p>
                    <span className="font-semibold">
                      {t("ai.statusLabel")}
                    </span>{" "}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-xl shadow-lg p-6 sm:p-8 ${
                    plan.popular ? "ring-2 ring-blue-600 transform scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        {t("pricing:popularLabel")}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {plan.price}
                      </div>
                      {plan.originalPrice && (
                        <div className="text-base sm:text-lg text-gray-500 line-through">
                          {t("pricing:wasPrice")} {plan.originalPrice}
                          {t("pricing:perAgentPerMonth")}
                        </div>
                      )}
                    </div>
                    {plan.badge && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                        {plan.badge}
                      </span>
                    )}
                    <p className="text-sm sm:text-base text-gray-600">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-sm sm:text-base text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleGetStarted}
                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.name === t("pricing:freemium.name")
                      ? t("pricing:freemium.ctaButton")
                      : t("pricing:ctaButton")}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {t("pricing.customSolutionPrompt")}
              </p>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base"
              >
                {t("pricing.contactUs")}
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8 sm:py-12 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              {t("contact.title")}
            </h2>
            <p className="text-base sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto">
              {t("contact.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors"
              >
                {t("contact.ctaButton")}
              </button>
              <Link
                to="/contact"
                className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-600 hover:text-white transition-colors inline-block"
              >
                {t("contact.contactButton")}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-2xl font-bold text-blue-400 mb-4">
                  {t("common:appName")}
                </h4>
                <p className="text-gray-300 mb-4 max-w-md">
                  {t("footer.description")}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">{t("footer.product")}</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="#features"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.features")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.pricing")}
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.integrations")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.security")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">{t("footer.support")}</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link
                      to="/user-manual"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.userGuide")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.helpCenter")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.contactUs")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/promotional"
                      className="hover:text-white transition-colors"
                    >
                      {t("footer.presentation")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>{t("footer.copyright")}</p>
              <div className="mt-4 flex justify-center space-x-6 text-sm">
                <Link to="/legal" className="hover:text-white transition-colors">
                  {t("footer.legal")}
                </Link>
                <Link
                  to="/user-manual"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.userManual")}
                </Link>
                <Link
                  to="/promotional"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.presentation")}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </Layout>
    </Suspense>
  );
};

export default LandingPage;
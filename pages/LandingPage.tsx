import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/FormElements";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import FreemiumPlanIcon from "../components/plan_images/FreemiumPlanIcon";
import StandardPlanIcon from "../components/plan_images/StandardPlanIcon";
import ProPlanIcon from "../components/plan_images/ProPlanIcon";

// Feature Icons
const FeatureIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary ${className}`}
  >
    {children}
  </div>
);

const AiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5M12 12a4.5 4.5 0 0 1-4.5 4.5V12a4.5 4.5 0 0 1 4.5 4.5Z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z"
    />
  </svg>
);

const VoiceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-6 0v1.5a3 3 0 0 0 3 3Z"
    />
  </svg>
);

const CheckIcon = () => (
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
);

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);

  const features = [
    {
      icon: <AiIcon />,
      titleKey: "landing.features.ai.title",
      descKey: "landing.features.ai.desc",
    },
    {
      icon: <ShieldIcon />,
      titleKey: "landing.features.secure.title",
      descKey: "landing.features.secure.desc",
    },
    {
      icon: <VoiceIcon />,
      titleKey: "landing.features.voice.title",
      descKey: "landing.features.voice.desc",
    },
  ];

  const pricingTiers = [
    {
      nameKey: "pricing.freemium.name",
      icon: <FreemiumPlanIcon className="w-10 h-10 text-slate-400" />,
      priceKey: "pricing.freemium.price",
      descKey: "pricing.freemium.desc",
      features: [
        "pricing.freemium.feature1",
        "pricing.freemium.feature2",
        "pricing.freemium.feature3",
      ],
      buttonKey: "pricing.button.signUp",
      buttonLink: "/signup",
      isPopular: false,
    },
    {
      nameKey: "pricing.standard.name",
      icon: <StandardPlanIcon className="w-10 h-10 text-primary" />,
      priceKey: "pricing.standard.price",
      descKey: "pricing.standard.desc",
      features: [
        "pricing.standard.feature1",
        "pricing.standard.feature2",
        "pricing.standard.feature3",
        "pricing.standard.feature4",
      ],
      buttonKey: "pricing.button.getStarted",
      buttonLink: "/signup",
      isPopular: true,
    },
    {
      nameKey: "pricing.pro.name",
      icon: <ProPlanIcon className="w-10 h-10 text-amber-500" />,
      priceKey: "pricing.pro.price",
      descKey: "pricing.pro.desc",
      features: [
        "pricing.pro.feature1",
        "pricing.pro.feature2",
        "pricing.pro.feature3",
        "pricing.pro.feature4",
      ],
      buttonKey: "pricing.button.getStarted",
      buttonLink: "/signup",
      isPopular: false,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        <Navbar />
        <main className="pt-16">
          {/* Hero Section avec vidéo */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex justify-center items-center mb-8">
                <img
                  src="https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj"
                  alt="Nexus Support Hub Logo"
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
                <h1 className="text-5xl md:text-6xl font-bold text-white">
                  {t("appName")}
                </h1>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("landing.hero.title")}
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                {t("landing.hero.subtitle")}
              </p>

              {/* Boutons d'action avec vidéo */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/signup" className="block">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg w-full"
                  >
                    {t("landing.hero.ctaButton")}
                  </Button>
                </Link>

                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {t("landing.hero.watchDemo", {
                    default: "Voir la démonstration",
                  })}
                </button>
              </div>

              {/* Modal vidéo */}
              {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-full overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {t("landing.video.title", {
                          default: "Découvrez Nexus Support Hub",
                        })}
                      </h3>
                      <button
                        onClick={() => setShowVideo(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src="https://www.youtube.com/embed/OnfUuaRlukQ?autoplay=1"
                        title="Nexus Support Hub Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-96 rounded"
                      ></iframe>
                    </div>
                    <div className="mt-4 text-center">
                      <a
                        href="https://youtu.be/OnfUuaRlukQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        {t("landing.video.watchOnYouTube", {
                          default: "Regarder sur YouTube",
                        })}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <main>
            {/* Features Section */}
            <section id="features" className="py-20 sm:py-24 bg-slate-50">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {t("landing.features.title")}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    {t("landing.features.subtitle")}
                  </p>
                </div>
                <div className="mt-16 grid md:grid-cols-3 gap-12">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center"
                    >
                      <FeatureIcon>{feature.icon}</FeatureIcon>
                      <h3 className="mt-6 text-xl font-bold text-slate-800">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="mt-2 text-slate-600">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-24 bg-white">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {t("pricing.title")}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    {t("pricing.subtitle")}
                  </p>
                </div>
                <div className="mt-16 grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {pricingTiers.map((tier) => (
                    <div
                      key={t(tier.nameKey)}
                      className={`border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl ${
                        tier.isPopular
                          ? "border-primary shadow-xl"
                          : "border-slate-200 shadow-lg"
                      }`}
                    >
                      {tier.isPopular && (
                        <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full self-center mb-4">
                          {t("pricing.popular")}
                        </span>
                      )}
                      <div className="mx-auto mb-4">{tier.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {t(tier.nameKey)}
                      </h3>
                      <p className="mt-2 text-slate-500 flex-grow">
                        {t(tier.descKey)}
                      </p>
                      <div className="mt-6">
                        <span className="text-4xl font-bold">
                          {t(tier.priceKey)}
                        </span>
                        <span className="text-slate-500 ms-1">
                          {t("pricing.perAgentPerMonth")}
                        </span>
                      </div>
                      <ul className="mt-8 space-y-4 flex-grow">
                        {tier.features.map((featureKey) => (
                          <li
                            key={featureKey}
                            className="flex items-center justify-center"
                          >
                            <div className="flex-shrink-0 text-green-500">
                              <CheckIcon />
                            </div>
                            <span className="ms-3 text-slate-600">
                              {t(featureKey)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <Link to={tier.buttonLink} className="block w-full">
                          <Button
                            variant={tier.isPopular ? "primary" : "outline"}
                            size="lg"
                            className="w-full"
                          >
                            {t(tier.buttonKey)}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-12 text-slate-500">
                  <p>
                    {t("pricing.enterprise.text")}{" "}
                    <Link
                      to="/contact"
                      className="text-primary hover:underline font-semibold"
                    >
                      {t("pricing.enterprise.link")}
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </main>
        </main>
      </div>
    </Layout>
  );
};

export default LandingPage;

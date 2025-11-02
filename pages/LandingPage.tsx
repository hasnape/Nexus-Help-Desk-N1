import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/FormElements";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import PricingSection from "../components/PricingSection";
// import TestimonialsSection from "../components/TestimonialsSection";
import { useTranslation } from "react-i18next";
import InfographieNexus from "../InfographieNexus";

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

export interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  // Replace with your actual video player implementation
  return (
    <iframe
      width="100%"
      height="100%"
      src={videoUrl}
      title="Video Player"
      style={{ border: 0 }}
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
  );
};

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

  // Avantages suggérés dans la revue
  const advantages = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-accent"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      titleKey: "landing.advantages.speed.title",
      descKey: "landing.advantages.speed.desc", //
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-accent"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      titleKey: "landing.advantages.security.title", // Nouvelle clé de traduction
      descKey: "landing.advantages.security.desc", // Nouvelle clé de traduction
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-accent"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v18h18"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 14.25 10.5 18l4.5-6 3 3"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75V18m4.5-6.75V18m4.5-9V18"
          />
        </svg>
      ),
      titleKey: "landing.advantages.analytics.title", // Nouvelle clé de traduction
      descKey: "landing.advantages.analytics.desc", // Nouvelle clé de traduction
    },
  ];

  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        <Navbar />
        <main className="pt-16">
          <section className="py-8 px-4 sm:px-6 lg:px-8 text-white text-center">
            {" "}
            {/* padding vertical réduit */}
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("landing.hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-3xl mx-auto">
                {t("landing.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 sm:mb-8">
                <Link to="/signup" className="block">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    {t("landing.hero.ctaButton")}
                  </Button>
                </Link>
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg w-full sm:w-auto justify-center"
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
                <Link to="/infographie" className="block w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    {t("infographie.seeMore", {
                      default: "Voir l’infographie",
                    })}
                  </Button>
                </Link>
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
                      <VideoPlayer videoUrl="https://www.youtube.com/embed/OnfUuaRlukQ?autoplay=1" />
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

          {/* 2. Section Vidéo de Présentation */}
          <section id="presentation-video" className="py-8 bg-slate-100">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  {t("landing.video.title", {
                    default: "Découvrez Nexus Support Hub en vidéo",
                  })}
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  {t("landing.video.subtitle", {
                    default:
                      "Une présentation rapide de nos services et de notre valeur ajoutée.",
                  })}
                </p>
              </div>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg bg-black">
                <VideoPlayer videoUrl="https://www.youtube.com/embed/OnfUuaRlukQ" />
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
          </section>

          {/* 3. Fonctionnalités */}
          <section id="features" className="py-8 bg-slate-50">
            <div className="container mx-auto px-4 max-w-screen-lg">
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
                    <p className="mt-2 text-slate-600 text-sm md:text-base">
                      {t(feature.descKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Avantages */}
          <section id="advantages" className="py-8 bg-white">
            <div className="container mx-auto px-4 max-w-screen-lg">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  {t("landing.advantages.title", {
                    default: "Pourquoi choisir Nexus Support Hub ?",
                  })}
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  {t("landing.advantages.subtitle", {
                    default:
                      "Découvrez les bénéfices concrets pour votre équipe et vos clients.",
                  })}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-lg shadow-sm"
                  >
                    <div className="mb-4">{advantage.icon}</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {t(advantage.titleKey)}
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base">
                      {t(advantage.descKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          
          
          <PricingSection />

          {/* 6. Infographie Technique */}
          <section id="infographie" className="py-8 bg-white">
            <div className="container mx-auto px-4 max-w-screen-lg">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  {t("infographie.title", { default: "Infographie technique" })}
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  {t("infographie.subtitle", {
                    default:
                      "Découvrez l’architecture et les technologies clés de Nexus Support Hub.",
                  })}
                </p>
                <Link
                  to="/infographie"
                  className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  {t("infographie.seeMore", {
                    default: "Voir l’infographie complète",
                  })}
                </Link>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-5xl">
                  {" "}
                  {/* Passez de max-w-3xl à max-w-5xl */}
                  <InfographieNexus />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default LandingPage;

export function WhyChooseSection() {
  const { t } = useTranslation();

  return (
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
        {t("landing.whyChooseNexus.title")}
      </h2>
      <p className="mt-4 text-lg text-slate-600">
        {t("landing.whyChooseNexus.subtitle")}
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/FormElements";
import PricingSection from "../components/PricingSection";
// import TestimonialsSection from "../components/TestimonialsSection";
import { useTranslation } from "react-i18next";
import InfographieNexus from "../InfographieNexus";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";

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
  const { t, i18n } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);

  const pillars = [
    {
      icon: <AiIcon />,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.desc"),
    },
    {
      icon: <ShieldIcon />,
      title: t("landing.features.secure.title"),
      description: t("landing.features.secure.desc"),
    },
    {
      icon: <VoiceIcon />,
      title: t("landing.features.voice.title"),
      description: t("landing.features.voice.desc"),
    },
  ];

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
            d="M6 13.5 9.75 17.25 18 6.75"
          />
        </svg>
      ),
      title: t("landing.advantages.speed.title"),
      description: t("landing.advantages.speed.desc"),
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
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z"
          />
        </svg>
      ),
      title: t("landing.advantages.security.title"),
      description: t("landing.advantages.security.desc"),
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
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-6 0v1.5a3 3 0 0 0 3 3Z"
          />
        </svg>
      ),
      title: t("landing.advantages.voice.title"),
      description: t("landing.advantages.voice.desc"),
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="min-h-screen">
          <div className="pt-16">
            <section className="py-8 px-4 sm:px-6 lg:px-8 text-white text-center">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {t("landing.hero.title", {
                    defaultValue: "Help desk IA autonome pour votre support N1 → N2",
                  })}
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-4 max-w-4xl mx-auto">
                  {t("landing.hero.subtitlePrimary", {
                    defaultValue:
                      "Nexus Support Hub automatise le support de niveau 1 (N1) et assiste le niveau 2 (N2) en Français, Anglais et Arabe.",
                  })}
                </p>
                <p className="text-base text-slate-200 max-w-4xl mx-auto mb-4">
                  {t("landing.hero.subtitleSecondary", {
                    defaultValue:
                      "Architecture multi-entreprises sécurisée, inspirée du RGAA 4.1 et entièrement hébergée sur Supabase (RLS, PostgreSQL).",
                  })}
                </p>
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 text-sm font-semibold mb-6">
                  {t("landing.hero.betaBadge", {
                    defaultValue: "Bêta privée • Démo sur demande",
                  })}
                </div>
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
                    {t("landing.hero.watchDemo")}
                  </button>
                  <Link to="/infographie" className="block w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="px-8 py-4 text-lg w-full sm:w-auto"
                    >
                      {t("landing.hero.infographieLink")}
                    </Button>
                  </Link>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  <Link to="/accessibilite" className="underline">
                    {t("landing.hero.accessStatement")}
                  </Link>
                  <span aria-hidden="true"> · </span>
                  <Link to="/contact" className="underline">
                    {t("landing.hero.accessContact")}
                  </Link>
                </p>
                {showVideo && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-full overflow-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {t("landing.video.title")}
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
                          {t("landing.video.watchOnYoutube")}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section id="presentation" className="py-8 bg-white">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                      {t("landing.presentation.title")}
                    </h2>
                    <p className="text-lg text-slate-700 mb-6">
                      {t("landing.presentation.description")}
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {t("landing.presentation.forWho.title")}
                      </h3>
                      <p className="text-slate-700 mb-3">
                        {t("landing.presentation.forWho.intro")}
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-slate-700">
                        <li>{t("landing.presentation.forWho.items.0")}</li>
                        <li>{t("landing.presentation.forWho.items.1")}</li>
                        <li>{t("landing.presentation.forWho.items.2")}</li>
                      </ul>
                      <p className="text-slate-700 font-semibold mt-4">
                        {t("landing.presentation.problems.title")}
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-2">
                        <li>{t("landing.presentation.problems.items.0")}</li>
                        <li>{t("landing.presentation.problems.items.1")}</li>
                        <li>{t("landing.presentation.problems.items.2")}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-lg overflow-hidden shadow-lg bg-black aspect-w-16 aspect-h-9">
                      <VideoPlayer videoUrl="https://www.youtube.com/embed/OnfUuaRlukQ" />
                    </div>
                    <div className="text-center">
                      <a
                        href="https://youtu.be/OnfUuaRlukQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                    
                        {t("landing.video.watchOnYoutube")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" className="py-8 bg-slate-50">
              <div className="container mx-auto px-4 max-w-screen-lg">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    Trois piliers pour un support N1 → N2 fiable
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    IA intégrée, multi-entreprises, multi-langues et accessibilité pour des équipes support plus efficaces.
                  </p>
                </div>
                <div className="mt-16 grid md:grid-cols-3 gap-12">
                  {pillars.map((pillar, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center"
                    >
                      <FeatureIcon>{pillar.icon}</FeatureIcon>
                      <h3 className="mt-6 text-xl font-bold text-slate-800">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-slate-600 text-sm md:text-base">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="advantages" className="py-8 bg-white">
              <div className="container mx-auto px-4 max-w-screen-lg">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {t("landing.advantages.title")}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    {t("landing.advantages.subtitle")}
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {advantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="p-6 bg-slate-50 rounded-xl shadow-sm border border-slate-100"
                    >
                      <div className="mb-4">{advantage.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {advantage.title}
                      </h3>
                      <p className="text-slate-600 text-sm md:text-base">
                        {advantage.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="impact" className="py-8 bg-slate-50">
              <div className="container mx-auto px-4 max-w-4xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  {t("landing.impact.title")}
                </h2>
                <p className="mt-4 text-lg text-slate-700">
                  {t("landing.impact.description")}
                </p>
              </div>
            </section>

            <section id="accessibilite-rgaa" className="py-8 bg-white">
              <div className="container mx-auto px-4 max-w-screen-lg">
                <div className="text-center max-w-3xl mx-auto mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    Accessibilité
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    L’interface de Nexus est conçue en s’inspirant du RGAA 4.1 (niveau AA) :
                  </p>
                </div>

                <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-700 space-y-2">
                  <p>{t("landing.rgaa.li1")}</p>
                  <p>{t("landing.rgaa.li2")}</p>
                  <p>{t("landing.rgaa.li3")}</p>
                  <p>{t("landing.rgaa.li4")}</p>
                  <p className="mt-3">{t("landing.rgaa.li5")}</p>
                </div>

                <p className="mt-6 text-center">
                  <Link to="/accessibilite" className="text-primary underline">
                    {t("landing.rgaa.statementLinkFull")}
                  </Link>
                </p>
              </div>
            </section>

            <section id="setup-7-min" className="py-8 bg-slate-50">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center">
                  Mise en route en 7 minutes
                </h2>
                <ol className="list-decimal pl-6 mt-6 space-y-2 text-slate-700">
                  <li>
                    <strong>{t("landing.setup.s1.strong")}</strong> {t("landing.setup.s1.text")}
                  </li>
                  <li>
                    <strong>{t("landing.setup.s2.strong")}</strong> {t("landing.setup.s2.text")}
                  </li>
                  <li>
                    <strong>{t("landing.setup.s3.strong")}</strong> {t("landing.setup.s3.text")}
                  </li>
                  <li>
                    <strong>{t("landing.setup.s4.strong")}</strong> {t("landing.setup.s4.text")}
                  </li>
                </ol>
                <div
                  className="mt-5 flex gap-3 justify-center"
                  role="group"
                  aria-label={t("landing.setup.actionsAria")}
                >
                  <Link to="/signup">
                    <Button size="lg" className="px-6">
                      {t("landing.hero.ctaButton")}
                    </Button>
                  </Link>
                  <Link to="/guide-onboarding">
                    <Button variant="secondary" size="lg" className="px-6">
                      Guide d’onboarding
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            <section id="pricing" className="py-8 bg-white">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-slate-800">
                  <h2 className="text-2xl font-bold mb-2">{t("landing.pricing.beta.title")}</h2>
                  <p className="text-slate-700">{t("landing.pricing.beta.description")}</p>
                  <ul className="list-disc pl-5 mt-3 space-y-1 text-slate-700">
                    <li>{t("landing.pricing.beta.points.0")}</li>
                    <li>{t("landing.pricing.beta.points.1")}</li>
                    <li>{t("landing.pricing.beta.points.2")}</li>
                  </ul>
                </div>
                <PricingSection />
                {i18n.language?.startsWith("fr") && (
                  <div className="mt-10 bg-sky-50 border border-sky-100 rounded-2xl p-6 text-slate-800">
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900">
                      Tarifs de lancement – phase bêta
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Les tarifs actuels (Freemium, Standard 19 €/mois, Pro 39 €/mois) sont des offres de lancement réservées à
                      la phase bêta de Nexus Support Hub. Les premiers clients conservent ces prix à vie, même lorsque la grille
                      tarifaire sera réajustée à la hausse pour les nouveaux arrivants.
                    </p>
                    <ul className="mt-4 space-y-2 text-slate-700 list-disc ps-5">
                      <li>Accès anticipé au moteur Nexus (automatisation N1, assistance N2).</li>
                      <li>Infrastructure sécurisée (Supabase, RLS, RGPD, RGAA 4.1).</li>
                      <li>Accompagnement renforcé pendant la phase de lancement.</li>
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <section id="infographie" className="py-8 bg-white">
              <div className="container mx-auto px-4 max-w-screen-lg">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {t("infographie.title", { defaultValue: "Infographie technique" })}
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    {t("infographie.subtitle", {
                      defaultValue:
                        "Découvrez l’architecture et les technologies clés de Nexus Support Hub.",
                    })}
                  </p>
                  <Link
                    to="/infographie"
                    className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    {t("infographie.seeMore", {
                      defaultValue: "Voir l’infographie complète",
                    })}
                  </Link>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-5xl">
                    <InfographieNexus />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <NexusSalesBotWidget />
    </>
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

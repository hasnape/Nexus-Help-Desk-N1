import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import PricingSection from "../components/PricingSection";
import InfographieNexus from "../InfographieNexus";
import { Button } from "../components/FormElements";
import NexusSalesBotWidget from "../components/NexusSalesBotWidget";

const AiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="m17.656 6.344-2.828 2.828" />
    <path d="m9.172 14.828-2.828 2.828" />
    <path d="M21 12h-4" />
    <path d="M7 12H3" />
    <path d="m17.656 17.656-2.828-2.828" />
    <path d="m9.172 9.172-2.828-2.828" />
  </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3 5 6v6c0 4.5 3.5 8.5 7 9 3.5-.5 7-4.5 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const VoiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
    <path d="M12 19v2" />
  </svg>
);

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);

  const benefits = [
    {
      title: t("landing.benefits.n1Reduction.title"),
      body: t("landing.benefits.n1Reduction.body"),
    },
    {
      title: t("landing.benefits.escalationControl.title"),
      body: t("landing.benefits.escalationControl.body"),
    },
    {
      title: t("landing.benefits.multiTenant.title"),
      body: t("landing.benefits.multiTenant.body"),
    },
    {
      title: t("landing.benefits.accessibility.title"),
      body: t("landing.benefits.accessibility.body"),
    },
  ];

  const pillars = [
    {
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.desc"),
      Icon: AiIcon,
    },
    {
      title: t("landing.features.secure.title"),
      description: t("landing.features.secure.desc"),
      Icon: ShieldIcon,
    },
    {
      title: t("landing.features.voice.title"),
      description: t("landing.features.voice.desc"),
      Icon: VoiceIcon,
    },
  ];

  const advantages = [
    { title: t("landing.advantages.security.title"), description: t("landing.advantages.security.desc") },
    { title: t("landing.advantages.dashboard.title"), description: t("landing.advantages.dashboard.desc") },
    { title: t("landing.advantages.analytics.title"), description: t("landing.advantages.analytics.desc") },
    { title: t("landing.advantages.voice.title"), description: t("landing.advantages.voice.desc") },
    { title: t("landing.advantages.multilingual.title"), description: t("landing.advantages.multilingual.desc") },
    { title: t("landing.advantages.cost.title"), description: t("landing.advantages.cost.desc") },
  ];

  const useCases = [
    {
      title: t("landing.useCases.saas.title"),
      description: t("landing.useCases.saas.body"),
    },
    {
      title: t("landing.useCases.msp.title"),
      description: t("landing.useCases.msp.body"),
    },
    {
      title: t("landing.useCases.internalIt.title"),
      description: t("landing.useCases.internalIt.body"),
    },
    {
      title: t("landing.useCases.specialized.title"),
      description: t("landing.useCases.specialized.body"),
    },
  ];

  const setupSteps = [
    { strong: t("landing.setup.s1.strong"), text: t("landing.setup.s1.text") },
    { strong: t("landing.setup.s2.strong"), text: t("landing.setup.s2.text") },
    { strong: t("landing.setup.s3.strong"), text: t("landing.setup.s3.text") },
    { strong: t("landing.setup.s4.strong"), text: t("landing.setup.s4.text") },
  ];

  const rgaaList = [
    t("landing.rgaa.li1"),
    t("landing.rgaa.li2"),
    t("landing.rgaa.li3"),
    t("landing.rgaa.li4"),
    t("landing.rgaa.li5"),
  ];

  return (
    <>
      <Layout>
        <main className="min-h-[calc(100vh-5rem)] bg-slate-50">
          <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
                  {t("landing.hero.badge")}
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl leading-tight font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                    {t("landing.hero.title")}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    {t("landing.hero.subtitlePrimary")}
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    {t("landing.hero.subtitleSecondary")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto px-6 py-3 text-base font-semibold">
                      {t("landing.hero.primaryCta")}
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold"
                    onClick={() => setShowVideo(true)}
                  >
                    {t("landing.hero.secondaryCta")}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                  <Link to="/infographie" className="font-semibold text-primary hover:text-primary-dark">
                    {t("landing.hero.infographieLink")}
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/accessibilite" className="font-semibold text-primary hover:text-primary-dark">
                    {t("landing.hero.accessStatement")}
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/contact" className="font-semibold text-primary hover:text-primary-dark">
                    {t("landing.hero.accessContact")}
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{t("landing.hero.assuranceTitle")}</p>
                    <p className="text-slate-600">{t("landing.hero.assuranceBody")}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{t("landing.hero.complianceTitle")}</p>
                    <p className="text-slate-600">{t("landing.hero.complianceBody")}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-100 via-white to-slate-100 blur-3xl" aria-hidden />
                <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-4">
                    <p className="text-xs uppercase tracking-wide text-indigo-200">
                      {t("landing.hero.previewBadge")}
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4 shadow-sm">
                      <InfographieNexus />
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {t("landing.hero.previewCaption")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.video.title")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.videoSection.title")}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{t("landing.videoSection.subtitle")}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/demo">
                    <Button className="px-5 py-3 text-sm font-semibold">{t("landing.video.watchOnYoutube")}</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="px-5 py-3 text-sm font-semibold"
                    onClick={() => setShowVideo(true)}
                  >
                    {t("landing.video.viewOnYoutube")}
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="relative pb-[56.25%]">
                  <iframe
                    src="https://www.youtube.com/embed/OnfUuaRlukQ"
                    title="Nexus Support Hub Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.features.badge", { defaultValue: t("landing.features.title") })}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.features.title")}</h2>
                <p className="max-w-3xl text-sm text-slate-600">{t("landing.features.subtitle")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pillars.map(({ title, description, Icon }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-slate-900">{title}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.advantages.title")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.advantages.title")}</h2>
                <p className="max-w-3xl text-sm text-slate-600">{t("landing.advantages.subtitle")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {advantages.map((advantage) => (
                  <div key={advantage.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm space-y-2">
                    <p className="text-base font-semibold text-slate-900">{advantage.title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{advantage.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.benefits.badge")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.benefits.title")}</h2>
                <p className="max-w-3xl text-sm text-slate-600">{t("landing.benefits.subtitle")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-sm font-semibold text-slate-900">{benefit.title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 grid gap-8 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.rgaa.title")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.rgaa.title")}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{t("landing.rgaa.subtitle")}</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {rgaaList.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/accessibilite" className="text-primary font-semibold hover:text-primary-dark">
                    {t("landing.rgaa.statementLink")}
                  </Link>
                  <Link to="/contact" className="text-primary font-semibold hover:text-primary-dark">
                    {t("landing.hero.accessContact")}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <InfographieNexus />
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border-b border-slate-200 py-10 lg:py-16" aria-labelledby="setup">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.setup.actionsAria")}</p>
                <h2 id="setup" className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {t("landing.setup.title")}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {setupSteps.map((step, index) => (
                  <div key={step.strong} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">0{index + 1}</p>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{step.strong}</span> {step.text}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/user-manual" className="inline-flex text-primary font-semibold hover:text-primary-dark">
                {t("landing.setup.ctaGuide")}
              </Link>
            </div>
          </section>

          <section className="bg-white border-b border-slate-200 py-10 lg:py-16" id="pricing">
            <div className="mx-auto max-w-6xl px-4 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.pricing.badge")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.pricing.title")}</h2>
                <p className="max-w-2xl text-sm text-slate-600">{t("landing.pricing.subtitle")}</p>
              </div>
              <PricingSection />
            </div>
          </section>

          <section className="bg-slate-50 border-b border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{t("landing.useCases.badge")}</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{t("landing.useCases.title")}</h2>
                <p className="max-w-3xl text-sm text-slate-600">{t("landing.useCases.subtitle")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {useCases.map((useCase) => (
                  <div key={useCase.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                    <p className="text-base font-semibold text-slate-900">{useCase.title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border-t border-slate-200 py-10 lg:py-16">
            <div className="mx-auto max-w-5xl px-4">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-slate-900 p-6 lg:p-8 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-indigo-100">{t("landing.finalCta.badge")}</p>
                  <h3 className="text-2xl font-bold text-white">{t("landing.finalCta.title")}</h3>
                  <p className="text-sm text-indigo-100 max-w-2xl">{t("landing.finalCta.subtitle")}</p>
                </div>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto px-6 py-3 text-base font-semibold bg-white text-slate-900 hover:bg-slate-100">
                    {t("landing.finalCta.button")}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </Layout>

      <NexusSalesBotWidget />

      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-slate-700 shadow hover:text-slate-900"
              aria-label={t("landing.hero.watchDemo")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative pb-[56.25%]">
              <iframe
                src="https://www.youtube.com/embed/OnfUuaRlukQ?autoplay=1"
                title="Nexus Support Hub Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;

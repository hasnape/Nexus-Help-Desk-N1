import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import PricingSection from "../components/PricingSection";
import InfographieNexus from "../InfographieNexus";
import { Button } from "../components/FormElements";
import { useTranslation } from "react-i18next";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

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

  return (
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
                  {t("landing.hero.subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto px-6 py-3 text-base font-semibold">
                    {t("landing.hero.primaryCta")}
                  </Button>
                </Link>
                <Link to="/demo" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto px-6 py-3 text-base font-semibold">
                    {t("landing.hero.secondaryCta")}
                  </Button>
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
          <div className="mx-auto max-w-6xl px-4 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                {t("landing.benefits.badge")}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {t("landing.benefits.title")}
              </h2>
              <p className="max-w-3xl text-sm text-slate-600">{t("landing.benefits.subtitle")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                >
                  <p className="text-sm font-semibold text-slate-900">{benefit.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 border-b border-slate-200 py-10 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                {t("landing.useCases.badge")}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {t("landing.useCases.title")}
              </h2>
              <p className="max-w-3xl text-sm text-slate-600">{t("landing.useCases.subtitle")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <div
                  key={useCase.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2"
                >
                  <p className="text-sm font-semibold text-slate-900">{useCase.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-10 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {t("landing.infographic.title")}
            </h2>
            <p className="max-w-2xl text-sm text-slate-600">
              {t("landing.infographic.subtitle")}
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <InfographieNexus />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-10 lg:py-16" id="pricing">
          <div className="mx-auto max-w-6xl px-4 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                {t("landing.pricing.badge")}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {t("landing.pricing.title")}
              </h2>
              <p className="max-w-2xl text-sm text-slate-600">
                {t("landing.pricing.subtitle")}
              </p>
            </div>
            <PricingSection />
          </div>
        </section>

        <section className="bg-white border-t border-slate-200 py-10 lg:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-slate-900 p-6 lg:p-8 shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-indigo-100">
                  {t("landing.finalCta.badge")}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {t("landing.finalCta.title")}
                </h3>
                <p className="text-sm text-indigo-100 max-w-2xl">
                  {t("landing.finalCta.subtitle")}
                </p>
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
  );
};

export default LandingPage;

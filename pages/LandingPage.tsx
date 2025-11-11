import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import PricingSection from "../components/PricingSection";
import { Button, Input, Textarea } from "../components/FormElements";
import { supabase } from "@/services/supabaseClient";

interface DemoFormState {
  name: string;
  email: string;
  company: string;
  message: string;
}

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const demoSectionRef = useRef<HTMLDivElement | null>(null);
  const [formState, setFormState] = useState<DemoFormState>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = useMemo(
    () => [
      {
        title: t("landing.features.ai.title", { defaultValue: "IA native" }),
        description: t("landing.features.ai.desc", {
          defaultValue: "Catégorisation automatique, résumés intelligents et assistants contextuels.",
        }),
        icon: (
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5M12 12a4.5 4.5 0 0 1-4.5 4.5V12a4.5 4.5 0 0 1 4.5 4.5Z"
            />
          </svg>
        ),
      },
      {
        title: t("landing.features.secure.title", { defaultValue: "Sécurité Supabase" }),
        description: t("landing.features.secure.desc", {
          defaultValue: "RLS activé, isolation par entreprise et données hébergées chez nous.",
        }),
        icon: (
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z"
            />
          </svg>
        ),
      },
      {
        title: t("landing.features.voice.title", { defaultValue: "Multicanal" }),
        description: t("landing.features.voice.desc", {
          defaultValue: "Commandes vocales, multilingue FR/EN et interface localisée.",
        }),
        icon: (
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      },
    ],
    [t]
  );

  const scrollToDemo = () => {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (field: keyof DemoFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const { error } = await supabase.functions.invoke("request-demo", {
        body: {
          name: formState.name,
          email: formState.email,
          company: formState.company,
          message: formState.message,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      setFormState({ name: "", email: "", company: "", message: "" });
    } catch (rpcError) {
      console.debug("Demo request failed:", rpcError);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        <Navbar />
        <main className="pt-16">
          {/* 1. Hero Section */} {/* Bannière centrale */}
        <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 border-l-4 border-yellow-400 rounded-lg p-6 mb-8 shadow-md text-center">
          <p className="text-yellow-900 font-bold text-lg sm:text-xl">
            Freemium : <span className="font-semibold">Gratuit (stockage local inclus)</span> &nbsp;|&nbsp;
            Standard : <span className="font-semibold">1er mois à 5€ ensuite 10€/mois</span> &nbsp;|&nbsp;
            Pro : <span className="font-semibold">1er mois à 12€ ensuite 20€/mois</span>
          </p>
          <p className="text-yellow-800 text-sm mt-2">
            Choisissez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

          <section className="py-8 px-4 sm:px-6 lg:px-8 text-white text-center">
            {" "}
            {/* padding vertical réduit */}
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("landing.hero.title")}
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                {t("landing.hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/signup" className="sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("landing.hero.ctaStart")}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={scrollToDemo} className="w-full sm:w-auto">
                  {t("landing.hero.ctaDemo")}
                </Button>
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

          
          
          {/* 5. Tarification */}
          <section id="pricing" className="py-8 bg-slate-50">
            <div className="container mx-auto px-4 max-w-screen-lg">
               {/* Bannière centrale */}
        <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 border-l-4 border-yellow-400 rounded-lg p-6 mb-8 shadow-md text-center">
          <p className="text-yellow-900 font-bold text-lg sm:text-xl">
            Freemium : <span className="font-semibold">Gratuit (stockage local inclus)</span> &nbsp;|&nbsp;
            Standard : <span className="font-semibold">1er mois 5€, ensuite 10€/mois</span> &nbsp;|&nbsp;
            Pro :<span className="font-semibold">1er mois à 12€ ensuite 20€/mois</span>
          </p>

        </div>

              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  {t("pricing.title")}
                </h2>
                <p className="mt-2 text-sm text-slate-200">
                  {t("pricing.disclaimer")}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-100">
                  {features.map((feature, index) => (
                    <li key={feature.title ?? index} className="flex gap-3">
                      <span aria-hidden="true">{feature.icon}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">{feature.title}</span>
                        <span className="mt-1 block text-slate-300">{feature.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </section>

        <section className="bg-white py-16 text-slate-900">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={`${feature.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />

        <section ref={demoSectionRef} id="demo" className="bg-slate-900 py-20">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 lg:flex-row lg:items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("demo.title")}</h2>
              <p className="mt-3 text-base text-slate-300">
                {t("landing.hero.subtitle")}
              </p>
            </div>
            <div className="flex-1 rounded-3xl bg-white p-8 text-slate-900 shadow-xl">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label={t("demo.name")}
                  name="name"
                  value={formState.name}
                  onChange={handleChange("name")}
                  required
                />
                <Input
                  type="email"
                  label={t("demo.email")}
                  name="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  required
                />
                <Input
                  label={t("demo.company")}
                  name="company"
                  value={formState.company}
                  onChange={handleChange("company")}
                  required
                />
                <Textarea
                  label={t("demo.message")}
                  name="message"
                  rows={4}
                  value={formState.message}
                  onChange={handleChange("message")}
                />
                <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
                  {t("demo.submit")}
                </Button>
                {status === "success" && (
                  <p className="text-sm font-medium text-green-600">{t("demo.success")}</p>
                )}
                {status === "error" && (
                  <p className="text-sm font-medium text-red-600">{t("demo.error")}</p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default LandingPage;

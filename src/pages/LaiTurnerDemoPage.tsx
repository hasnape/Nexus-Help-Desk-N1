import React, { useState } from "react";
import Layout from "../components/Layout";
import { Button, Input } from "../components/FormElements";
import { useTranslation } from "react-i18next";
import { signInWithEmail, signUpWithEmail } from "../services/authService";

const LaiTurnerDemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setStatusType(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        setStatusMessage("Client portal access granted. You are now connected as a Lai & Turner client.");
      } else {
        await signUpWithEmail(email, password, {
          fullName,
          companyName: "LAI & TURNER Law Firm",
          role: "user",
          lang: "en",
        });
        setStatusMessage("Account created. Our team will reach out to finalize your secure onboarding.");
      }
      setStatusType("success");
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(error?.message || t("auth.error", { defaultValue: "An unexpected error occurred" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const chatMessages = [
    {
      role: "Client",
      content:
        "I need guidance for a family reunification case and want to ensure documents are bilingual (English and Cantonese).",
    },
    {
      role: "Nexus Assistant",
      content:
        "Absolutely. I will prepare a bilingual intake checklist and schedule a consultation with attorney Jimmy Lai for immigration strategy review.",
    },
    {
      role: "Attorney",
      content:
        "We'll file the petition this month, coordinate translation with our certified partner, and keep you updated through the Nexus client space.",
    },
  ];

  const faqItems = [
    {
      question: "Do you support clients outside the U.S.?",
      answer:
        "Yes. Jimmy Lai regularly assists clients in Hong Kong, Taiwan, and Europe, providing immigration filings and trial updates in English, Mandarin, and Cantonese.",
    },
    {
      question: "Can family law and immigration be handled together?",
      answer:
        "Our firm coordinates custody, spousal support, and immigration status so that relocation or visa renewals stay aligned with court timelines.",
    },
    {
      question: "How does the chat demo protect sensitive details?",
      answer:
        "The Nexus workspace keeps transcripts private to your case team. In production, we apply role-based access and redaction for court exhibits.",
    },
    {
      question: "What happens during trial preparation?",
      answer:
        "We assemble evidence packets, bilingual witness prep, and motion deadlines in one place, so your trial calendar is always synchronized.",
    },
  ];

  const capabilityHighlights = [
    "Bilingual client experience: English, Mandarin, and Cantonese across chat, FAQs, and document templates.",
    "Unified portal for immigration, family, and trial updates with court-friendly export formats.",
    "Automated reminders for biometrics, visa renewals, custody hearings, and evidence submissions.",
    "Secure collaboration space where Lai & Turner teams coordinate with interpreters and expert witnesses.",
  ];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-10">
          {/* Hero */}
          <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-primary">
                  LAI & TURNER Law Firm — Immigration, Family, Trial
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                  Nexus Support Hub for Lai & Turner clients
                </h1>
                <p className="text-slate-200 max-w-2xl">
                  A secure, bilingual experience tailored to Jimmy Lai’s practice areas. Coordinate immigration filings, family matters, and trial prep with transparent updates.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-slate-100">
                  <span className="rounded-full bg-white/10 px-3 py-1">Bilingual onboarding</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Client-grade chat</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Court-ready exports</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Privacy-first</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-5 border border-white/20 shadow-lg w-full max-w-md">
                <p className="text-sm uppercase tracking-wide text-slate-200">Live status</p>
                <div className="mt-2 text-3xl font-semibold">Client concierge is online</div>
                <p className="mt-2 text-slate-200 text-sm">
                  We maintain a 15-minute response goal for urgent immigration or family updates during business hours.
                </p>
              </div>
            </div>
          </section>

          {/* Grille principale */}
          <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-start">
            {/* Connexion / Création de compte */}
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary font-semibold">Client access</p>
                  <h2 className="text-xl font-semibold text-slate-900">LAI & TURNER secure portal</h2>
                  <p className="text-sm text-slate-600">
                    Create or access your space to follow immigration filings, family proceedings, and trial milestones.
                  </p>
                </div>
                <div className="flex gap-2 bg-slate-100 rounded-full p-1 text-sm font-medium">
                  <button
                    className={`rounded-full px-3 py-1 ${mode === "signin" ? "bg-white shadow" : "text-slate-500"}`}
                    onClick={() => setMode("signin")}
                  >
                    Sign in
                  </button>
                  <button
                    className={`rounded-full px-3 py-1 ${mode === "signup" ? "bg-white shadow" : "text-slate-500"}`}
                    onClick={() => setMode("signup")}
                  >
                    Create account
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <Input
                    label="Full name"
                    placeholder="e.g., Mei Lin"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                )}
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder={mode === "signin" ? "Enter your password" : "Choose a secure password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {statusMessage && (
                  <div
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      statusType === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {mode === "signin" ? "Access my portal" : "Start secure onboarding"}
                </Button>
              </form>

              <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-700">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="font-semibold text-primary">Immigration</p>
                  <p className="mt-1 text-slate-600">Biometrics, visa renewals, and consular packets tracked with due dates.</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">Family & trial</p>
                  <p className="mt-1 text-slate-600">Hearing dates, mediation notes, and evidence uploads with bilingual notes.</p>
                </div>
              </div>
            </div>

            {/* Chat demo + FAQ */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary font-semibold">Demo chat</p>
                    <h3 className="text-lg font-semibold text-slate-900">LAI & TURNER branded conversation</h3>
                    <p className="text-sm text-slate-600">Preview the tone, bilingual prompts, and transparent status updates.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1">Live-look</span>
                </div>

                <div className="mt-4 space-y-3">
                  {chatMessages.map((message, index) => (
                    <div key={message.role + index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                        <span>{message.role}</span>
                        <span>{index === 0 ? "Client intake" : index === 1 ? "AI concierge" : "Attorney confirmation"}</span>
                      </div>
                      <p className="mt-2 text-slate-800 text-sm leading-relaxed">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">FAQ</div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary font-semibold">Client FAQ</p>
                    <h3 className="text-lg font-semibold text-slate-900">Lai & Turner knowledge snippets</h3>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.question} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section Commercial proposal */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">Commercial proposal</p>
                <h2 className="text-2xl font-semibold text-slate-900">How Nexus accelerates LAI & TURNER</h2>
                <p className="text-slate-700 max-w-2xl">
                  Nexus Support Hub combines client communications, bilingual knowledge, and case coordination in one workspace tailored to immigration, family, and trial practices.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900 text-white p-5 w-full max-w-md shadow-lg">
                <p className="text-sm uppercase tracking-wide text-emerald-200 font-semibold">Outcome targets</p>
                <ul className="mt-3 space-y-2 text-slate-100 text-sm">
                  <li>• 15% faster document turnaround through structured checklists.</li>
                  <li>• 2x improvement in client satisfaction from multilingual updates.</li>
                  <li>• Court-ready briefs exported with evidence references intact.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {capabilityHighlights.map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-800 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">Secure evidence vault</span>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">Interpreter-friendly chat</span>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">Client-ready dashboards</span>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">No payment collection</span>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LaiTurnerDemoPage;

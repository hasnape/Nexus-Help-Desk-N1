import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/FormElements";
import { Button, Input } from "../components/FormElements";
import { useNavigate } from "react-router-dom";
import { signInWithEmail, signUpWithEmail } from "../services/authService";
import { useApp } from "../App";
import { supabase } from "../services/supabaseClient";

type AuthMode = "login" | "signup";

type ChatMessage = {
  from: "user" | "bot";
  text: string;
};

const LaiTurnerDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text:
        "Welcome to Lai & Turner Law. This secure help desk routes family, injury, criminal, and business immigration matters to the right attorney while keeping clients updated in plain language.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [dictationSupported, setDictationSupported] = useState(false);
  const [dictationStatus, setDictationStatus] = useState("Idle");
  const [dictationError, setDictationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsStatus, setTtsStatus] = useState("Ready");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const loadCompanyName = async (companyId?: string | null) => {
    if (!companyId) {
      setCompanyName(null);
      return;
    }
    setCompanyLoading(true);
    const { data, error } = await supabase.from("companies").select("name").eq("id", companyId).single();
    setCompanyName(!error ? data?.name ?? null : null);
    setCompanyLoading(false);
  };

  const faqs = [
    {
      question: "Which clients does Lai & Turner champion?",
      answer:
        "Families protecting their kids, injured clients seeking recovery, people defending their freedom, and founders hiring across borders.",
    },
    {
      question: "Which practice areas run through this portal?",
      answer:
        "Family Law, Personal Injury, Criminal Defense, and Business Immigration — each with tailored checklists and timelines.",
    },
    {
      question: "How do you keep the experience human?",
      answer: "Plain-English updates, bilingual support, and attorneys who prepare like every case is going to trial.",
    },
    {
      question: "How does Nexus Support Hub protect client data?",
      answer:
        "Role-based access, encrypted messaging, and secure authentication for clients, agents, and managers.",
    },
    {
      question: "What onboarding do you provide?",
      answer:
        "Discovery workshops, workflow setup by practice area, and continuous optimisation with your attorneys and staff.",
    },
  ];

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingAuth(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, {
          fullName: "LAI & TURNER Client",
          role: "user",
          companyName: "LAI & TURNER",
          lang: "en",
        });
        setAuthMessage(
          "Your Lai & Turner client account has been created. Please confirm your email to activate secure access."
        );
        setMode("login");
      } else {
        await signInWithEmail(email, password);
        setAuthMessage("You’re now connected to your Lai & Turner portal.");
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData.session?.user;
        const metadataCompany = (sessionUser?.user_metadata as any)?.company_name;
        const metadataRole = (sessionUser?.user_metadata as any)?.role;

        let resolvedRole: string | null = metadataRole ?? user?.role ?? null;
        let resolvedCompany: string | null = metadataCompany ?? companyName ?? null;

        if (!resolvedRole || !resolvedCompany) {
          const { data: profile } = await supabase
            .from("users")
            .select("role, company_id")
            .eq("auth_uid", sessionUser?.id || "")
            .single();

          resolvedRole = profile?.role ?? resolvedRole ?? null;
          if (profile?.company_id) {
            const { data: companyRow } = await supabase
              .from("companies")
              .select("name")
              .eq("id", profile.company_id)
              .single();
            resolvedCompany = companyRow?.name ?? resolvedCompany ?? null;
          }
        }

        if (resolvedCompany?.toLowerCase() === "lai & turner") {
          if (resolvedRole === "manager") {
            navigate("/lai-turner-law/manager");
          } else if (resolvedRole === "agent") {
            navigate("/lai-turner-law/agent");
          } else {
            navigate("/lai-turner-law/client-portal");
          }
        } else {
          setAuthError("This login is not associated with Lai & Turner. Please use your firm credentials.");
        }
      }
    } catch (error: any) {
      setAuthError(error?.message || "An unexpected error occurred.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { from: "user", text: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    setTimeout(() => {
      const botMessage: ChatMessage = {
        from: "bot",
        text:
          "Thanks for your message. A Lai & Turner coordinator will respond in secure messaging. For urgent matters, please call the firm.",
      };
      setChatMessages((prev) => [...prev, botMessage]);
    }, 400);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synthAvailable = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    setTtsSupported(synthAvailable);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setDictationStatus("Listening…");
      setDictationError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setDictationStatus("Idle");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setDictationStatus("Idle");
      setDictationError(event.error ? `Voice capture error: ${event.error}` : "Voice capture error");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      if (!transcript) return;
      setChatInput((prev) => (prev ? `${prev.trim()} ${transcript}`.trim() : transcript));
      setDictationStatus("Transcribed");
    };

    recognitionRef.current = recognition;
    setDictationSupported(true);

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (!ttsSupported) return;
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (!lastMessage || lastMessage.from !== "bot") return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(lastMessage.text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setTtsStatus("Playing reply");
    utterance.onend = () => setTtsStatus("Ready");
    utterance.onerror = () => setTtsStatus("Playback unavailable");

    synth.cancel();
    synth.speak(utterance);
  }, [chatMessages, ttsSupported]);

  useEffect(() => {
    loadCompanyName(user?.company_id);
  }, [user?.company_id]);

  const startDictation = () => {
    if (!dictationSupported || !recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
    } catch (error) {
      setDictationError("Unable to start voice dictation.");
    }
  };

  const stopDictation = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const isLaiTurner = (companyName || "").toLowerCase() === "lai & turner";

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4 space-y-10">
          <section className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Secure portal • Nexus Support Hub × LAI & TURNER Law Firm
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Client portal & AI Help Desk for LAI & TURNER Law
            </h1>
            <p className="max-w-5xl text-lg text-slate-700">
              Most lawyers chase verdicts. We chase justice. After seeing too many people reduced to case numbers, Lai & Turner Law delivers relentless advocacy with transparent pricing and communication in plain English.
            </p>
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-indigo-800">
              {[
                "Family Law",
                "Personal Injury",
                "Criminal Defense",
                "Business Immigration",
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-800"
                >
                  {label}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="pointer-events-none absolute inset-0 text-[120px] font-black uppercase tracking-widest text-slate-700/10">
                <div className="absolute -left-6 top-10 rotate-6">LAI & TURNER</div>
              </div>
              <div className="relative space-y-6 text-white">
                {user && isLaiTurner && (
                  <div className="space-y-2 rounded-2xl border border-emerald-400/60 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                    <div className="font-semibold">You’re authenticated with Lai & Turner.</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-white/10 px-3"
                        onClick={() => navigate("/lai-turner-law/client-portal")}
                      >
                        Open client portal
                      </Button>
                      {user.role === "agent" || user.role === "manager" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-white/10 px-3"
                          onClick={() => navigate("/lai-turner-law/agent")}
                        >
                          Open agent inbox
                        </Button>
                      ) : null}
                      {user.role === "manager" && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-white/10 px-3"
                          onClick={() => navigate("/lai-turner-law/manager")}
                        >
                          Open manager dashboard
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-full bg-slate-800/70 p-1 text-sm font-semibold">
                  <button
                    type="button"
                    className={`flex-1 rounded-full px-3 py-2 text-center transition ${
                      mode === "signup"
                        ? "bg-white text-slate-900"
                        : "text-slate-300 hover:text-white"
                    }`}
                    onClick={() => setMode("signup")}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-full px-3 py-2 text-center transition ${
                      mode === "login"
                        ? "bg-white text-slate-900"
                        : "text-slate-300 hover:text-white"
                    }`}
                    onClick={() => setMode("login")}
                  >
                    Log in
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">LAI & TURNER client access</h2>
                  <p className="text-sm text-slate-300">
                    Secure client & team portal powered by Nexus Support Hub.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleAuthSubmit}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    required
                    className="bg-white text-black"
                  />

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white text-black"
                  />
                  <Button type="submit" className="w-full" isLoading={loadingAuth}>
                    {mode === "signup" ? "Create account" : "Log in"}
                  </Button>
                </form>

                {authError && (
                  <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {authError}
                  </div>
                )}

                {authMessage && (
                  <div className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    {authMessage}
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  We enforce firm security policies (2FA, SSO, IP controls) while keeping conversations encrypted end-to-end.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="pointer-events-none absolute inset-0 text-[100px] font-black uppercase tracking-widest text-slate-700/10">
                  <div className="absolute -right-10 bottom-4 -rotate-6">LAI & TURNER</div>
                </div>
                <div className="relative space-y-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">LAI & TURNER – Client Support Chat</h2>
                      <p className="text-xs text-slate-300">
                        Powered by Nexus Support Hub – level 1 questions handled by AI, escalations routed to your team.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      <span className="text-lg leading-none">●</span> AI Assistant Online
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div
                    className="flex flex-col gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-3"
                    style={{ height: "14rem" }}
                  >
                      {chatMessages.map((message, index) => (
                        <div
                          key={`${message.from}-${index}`}
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                            message.from === "bot"
                              ? "self-start bg-white text-slate-900"
                              : "self-end bg-indigo-100 text-slate-900"
                          }`}
                        >
                          {message.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                        TTS: {ttsSupported ? ttsStatus : "Unavailable in this browser"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          dictationSupported
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        Voice dictation: {dictationSupported ? dictationStatus : "Not supported"}
                      </span>
                      {dictationError && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">{dictationError}</span>
                      )}
                    </div>
                    <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSendMessage}>
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question as a LAI & TURNER client…"
                        className="bg-white text-black"
                      />
                      <div className="flex items-center gap-2">
                        <Button type="submit" className="shrink-0 px-5">
                          Send
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="shrink-0 px-4"
                          onClick={isListening ? stopDictation : startDictation}
                          disabled={!dictationSupported}
                        >
                          {isListening ? "Stop voice" : "Dictate"}
                        </Button>
                      </div>
                    </form>
                    {!dictationSupported && (
                      <p className="mt-2 text-xs text-slate-600">
                        Voice capture is not available in this browser. You can still type to reach the team.
                      </p>
                    )}
                    {!ttsSupported && (
                      <p className="text-xs text-slate-600">
                        Text-to-speech playback is disabled because this browser does not support Web Speech synthesis.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Example of firm-specific FAQs</h3>
                <div className="mt-4 space-y-3">
                  {faqs.map((faq) => (
                    <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-sm text-slate-700">{faq.answer}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        These FAQs can be replaced with real content from your intake scripts, retainer process, and jurisdiction-specific information.
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {user && (
            <section className="rounded-3xl border border-indigo-100 bg-white/70 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Your Lai & Turner portals</p>
                  <h3 className="text-2xl font-bold text-slate-900">Jump into the right workspace</h3>
                  <p className="text-sm text-slate-700">
                    Client portal, agent inbox, and manager dashboard are separated so only Lai & Turner accounts see these views.
                  </p>
                </div>
                {companyLoading && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Verifying firm access…
                  </span>
                )}
              </div>

              {companyLoading ? null : isLaiTurner ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Client</p>
                      <h4 className="text-lg font-bold text-slate-900">Client portal</h4>
                      <p className="text-sm text-slate-700">
                        Track your matters, ask plain-language questions, and see the next step for your case.
                      </p>
                    </div>
                    <Button className="mt-4" onClick={() => navigate("/lai-turner-law/client-portal")}>Visit client portal</Button>
                  </div>
                  {user.role === "agent" || user.role === "manager" ? (
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Agent</p>
                        <h4 className="text-lg font-bold text-slate-900">Agent inbox</h4>
                        <p className="text-sm text-slate-700">
                          Triage cases by practice area, reply with empathy, and request documents without leaving the inbox.
                        </p>
                      </div>
                      <Button
                        className="mt-4"
                        variant="secondary"
                        onClick={() => navigate("/lai-turner-law/agent")}
                      >
                        Open agent inbox
                      </Button>
                    </div>
                  ) : null}
                  {user.role === "manager" && (
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Manager</p>
                        <h4 className="text-lg font-bold text-slate-900">Manager dashboard</h4>
                        <p className="text-sm text-slate-700">
                          Watch KPIs, monitor intake flow, and keep the Lai & Turner promise visible across every practice area.
                        </p>
                      </div>
                      <Button
                        className="mt-4"
                        variant="secondary"
                        onClick={() => navigate("/lai-turner-law/manager")}
                      >
                        View manager dashboard
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This portal area is reserved for Lai & Turner accounts.
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Commercial proposal for Lai & Turner Law Firm</h3>
            <p className="text-slate-700">
              Collaboration paths tailored to your family, injury, criminal defense, and business immigration matters — always with transparent pricing and no payment links here.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">AI-powered client intake & FAQ</h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>24/7 intake chat for immigration, criminal, and family law clients.</li>
                  <li>Automated triage and document checklists before consultations.</li>
                  <li>Centralised ticketing so your team never loses a client question.</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  To explore pricing and implementation, we can schedule a short strategy call.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Secure, multilingual client portal</h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Branded login area with LAI & TURNER logo and colors.</li>
                  <li>Messaging, document sharing, and status updates in English, Mandarin, Japanese, and German.</li>
                  <li>Role-based access for attorneys, staff, and clients.</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  To explore pricing and implementation, we can schedule a short strategy call.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Implementation & ongoing support</h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Discovery workshop to map your intake and case workflows.</li>
                  <li>Setup of templates and FAQs per practice area (immigration, family, criminal, estate planning, personal injury, real estate/business).</li>
                  <li>Training for your team and continuous optimisation based on real usage.</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  To explore pricing and implementation, we can schedule a short strategy call.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LaiTurnerDemoPage;

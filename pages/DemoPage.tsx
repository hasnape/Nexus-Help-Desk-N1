import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { baseFieldClasses } from "../components/FormElements";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqaqogdv";

type SubmissionState = null | "ok" | "ko";

const DemoPageContent: React.FC = () => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<SubmissionState>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-container section-stack">
      <section className="surface-card p-6 lg:p-8 space-y-5 max-w-3xl">
        <div className="space-y-2">
          <h1 className="section-title">{t("demo.title")}</h1>
          <p className="section-subtitle">{t("demo.subtitle")}</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setSent(null);
            const data = new FormData(event.currentTarget);

          try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
              method: "POST",
              body: data,
              headers: { Accept: "application/json" },
            });
            setSent(response.ok ? "ok" : "ko");
          } catch {
            setSent("ko");
          } finally {
            setLoading(false);
          }
        }}
      >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200" htmlFor="demo-name">
                {t("demo.name")}
              </label>
              <input
                id="demo-name"
                name="name"
                className={baseFieldClasses}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200" htmlFor="demo-email">
                {t("demo.email")}
              </label>
              <input
                id="demo-email"
                type="email"
                name="email"
                className={baseFieldClasses}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200" htmlFor="demo-company">
              {t("demo.company")}
            </label>
            <input
              id="demo-company"
              name="company"
              className={baseFieldClasses}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200" htmlFor="demo-message">
              {t("demo.message")}
            </label>
            <textarea
              id="demo-message"
              name="message"
              rows={4}
              className={`${baseFieldClasses} min-h-[80px]`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "…" : t("demo.send")}
            </button>

            {sent === "ok" ? (
              <p className="text-sm text-green-400">{t("demo.success")}</p>
            ) : null}
            {sent === "ko" ? (
              <p className="text-sm text-rose-300">{t("demo.error")}</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
};

const DemoPage: React.FC = () => {
  return <DemoPageContent />;
};

export default DemoPage;

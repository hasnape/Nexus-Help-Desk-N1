import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqaqogdv";

type SubmissionState = null | "ok" | "ko";

const DemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [sent, setSent] = useState<SubmissionState>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">{t("demo.title")}</h1>
      <p className="opacity-70 mb-6">{t("demo.subtitle")}</p>

      <form
        className="max-w-xl space-y-4"
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
        <div>
          <label className="block text-sm mb-1" htmlFor="demo-name">
            {t("demo.name")}
          </label>
          <input id="demo-name" name="name" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="demo-email">
            {t("demo.email")}
          </label>
          <input id="demo-email" type="email" name="email" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="demo-company">
            {t("demo.company")}
          </label>
          <input id="demo-company" name="company" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="demo-message">
            {t("demo.message")}
          </label>
          <textarea id="demo-message" name="message" rows={4} className="w-full border rounded px-3 py-2" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded border hover:bg-black hover:text-white disabled:opacity-50"
        >
          {loading ? "…" : t("demo.send")}
        </button>

        {sent === "ok" ? (
          <p className="text-green-600 mt-2">{t("demo.success")}</p>
        ) : null}
        {sent === "ko" ? (
          <p className="text-red-600 mt-2">{t("demo.error")}</p>
        ) : null}
      </form>
    </main>
  );
};

export default DemoPage;

import React from "react";
import { useTranslation } from "react-i18next";

import Layout from "../components/Layout";

const partners = [
  { name: "", logo: "" },
  { name: "", logo: "" },
];

const PartnersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout mainClassName="page-shell py-10 lg:py-14">
      <div className="page-container section-stack">
        <section className="surface-card p-6 lg:p-8 space-y-4">
          <p className="section-eyebrow">{t("partners.badge", { defaultValue: "Écosystème" })}</p>
          <h1 className="section-title">{t("partners.title", { defaultValue: "Nos partenaires" })}</h1>
          <p className="section-subtitle">
            {t("partners.subtitle", {
              defaultValue: "Les organisations qui accompagnent Nexus dans son déploiement.",
            })}
          </p>
          <div className="flex flex-wrap gap-8 items-center pt-2">
            {partners.map((p, index) => (
              <div key={`${p.name}-${index}`} className="surface-card-soft px-4 py-3 rounded-2xl text-center">
                <img
                  src={p.logo}
                  alt={p.name || t("partners.logoAlt", { defaultValue: "Logo partenaire" })}
                  className="h-12 mx-auto mb-2"
                  loading="lazy"
                  width={64}
                  height={48}
                />
                <span className="text-sm text-slate-200">{p.name || t("partners.soon", { defaultValue: "À venir" })}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PartnersPage;

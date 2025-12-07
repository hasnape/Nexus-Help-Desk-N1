import React, { useEffect } from "react";

import MarketingLayout from "../components/MarketingLayout";

const BLOG_POSTS = [
  {
    id: 1,
    title: "Comment réduire 40 % des tickets N1 sans embaucher ?",
    slug: "reduire-tickets-n1-40-pourcent",
    category: "Support automatisé",
    readingTime: "Lecture : 5 min",
    summary:
      "Comment configurer l’IA Nexus pour absorber les demandes récurrentes et libérer vos agents N2 dès la première semaine.",
    highlightTag: "Support IT",
  },
  {
    id: 2,
    title: "Mettre en place un help desk FR / EN / AR en moins d’une semaine",
    slug: "help-desk-multilingue",
    category: "Multilingue",
    readingTime: "Lecture : 6 min",
    summary:
      "Les étapes clés pour déployer Nexus dans trois langues, sans recruter d’équipe supplémentaire ni modifier vos outils internes.",
    highlightTag: "Multilingue",
  },
  {
    id: 3,
    title: "Organiser sa FAQ pour que l’IA Nexus réponde mieux",
    slug: "faq-optimisee-ia",
    category: "FAQ & IA",
    readingTime: "Lecture : 4 min",
    summary:
      "Structurer vos articles, procédures et captures d’écran pour maximiser la pertinence des réponses générées par l’IA Nexus.",
    highlightTag: "FAQ & IA",
  },
  {
    id: 4,
    title: "N1 → N2 : préparer vos agents avec des tickets déjà résumés",
    slug: "n1-vers-n2-preparer-agents",
    category: "Collaboration",
    readingTime: "Lecture : 7 min",
    summary:
      "Comment transmettre aux agents N2 des tickets contextualisés, priorisés et résumés automatiquement dès leur création.",
    highlightTag: "Productivité",
  },
];

const BlogPage: React.FC = () => {
  useEffect(() => {
    document.title = "Blog – Nexus Support Hub";
  }, []);

  return (
    <MarketingLayout>
      <div className="space-y-8">
        <header className="surface-card p-6 lg:p-8 space-y-3 text-center">
          <p className="section-eyebrow">Insights & marketing</p>
          <h1 className="section-title">Blog Nexus Support Hub</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Articles pratiques sur l’IA, le support N1 → N2 et l’organisation de votre help desk.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl shadow-lg bg-slate-900/60 border border-slate-800 px-6 py-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-500/20 text-indigo-200 px-3 py-1 text-[11px]">
                    {post.highlightTag}
                  </span>
                  <span className="text-slate-400">{post.category}</span>
                </span>
                <span className="text-slate-400">{post.readingTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-white">{post.title}</h2>
              <p className="text-slate-300 leading-relaxed">{post.summary}</p>
              <div className="pt-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/90 text-white px-4 py-2 text-sm font-semibold shadow-md opacity-80 cursor-not-allowed"
                  aria-disabled
                >
                  Lire l’article (bientôt)
                  <span aria-hidden className="text-slate-200">→</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </MarketingLayout>
  );
};

export default BlogPage;

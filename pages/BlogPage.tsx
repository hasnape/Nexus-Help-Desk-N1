import React, { useEffect, useState } from "react";

import MarketingLayout from "../components/MarketingLayout";
import { blogPosts } from "../content/blogPosts";

const BlogPage: React.FC = () => {
  const [formData, setFormData] = useState<BlogPost>({
    slug: "",
    title: "",
    city: "",
    date: "",
    excerpt: "",
    content: "",
  });
  const [generatedSnippet, setGeneratedSnippet] = useState<string>("");

  useEffect(() => {
    document.title = "Blog – Nexus Support Hub";
  }, []);

  const defaultSnippet = `{
  slug: "nouvel-article-nexus",
  title: "Titre de l’article",
  city: "Paris",
  date: "1 janvier 2025",
  excerpt: "Résumé court de l’article",
  content: \`Texte complet de l’article...\`,
},`;

  const adminPreview = generatedSnippet || defaultSnippet;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    const { slug, title, city, date, excerpt, content } = formData;
    const escapedContent = content.replace(/`/g, "\\`");
    const snippet = `{
  slug: "${slug}",
  title: "${title}",
  city: "${city}",
  date: "${date}",
  excerpt: "${excerpt}",
  content: \`${escapedContent}\`,
},`;
    setGeneratedSnippet(snippet);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adminPreview);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  return (
    <MarketingLayout>
      <div className="space-y-8">
        <header className="surface-card p-6 lg:p-8 space-y-3 text-center">
          <p className="section-eyebrow">Insights & marketing</p>
          <h1 className="section-title">Blog Nexus Support Hub</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Articles pratiques sur l’IA, le support N1 → N2 et l’organisation de
            votre help desk.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl shadow-lg bg-slate-900/60 border border-slate-800 px-6 py-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-500/20 text-indigo-200 px-3 py-1 text-[11px]">
                    {post.city}
                  </span>
                  <span className="text-slate-400">{post.date}</span>
                </span>
                <span className="text-slate-400">Blog Nexus</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{post.title}</h2>

              <p className="text-slate-300 leading-relaxed">{post.excerpt}</p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-800/70 text-slate-200 px-4 py-2 text-sm font-semibold">
                  Article complet disponible dans la prochaine version
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="surface-card p-6 lg:p-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="space-y-2 text-center">
            <p className="section-eyebrow">Section admin</p>
            <h2 className="section-title text-2xl">Ajouter un article (outil pour l’administrateur)</h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Génère un snippet TypeScript à copier-coller dans <code>content/blogPosts.ts</code>.
              Aucun enregistrement n’est fait côté serveur.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="title">
                  Titre
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Titre de l’article"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="slug">
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="mon-article-nexus"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="city">
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paris, Lyon, Alger…"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="5 avril 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="excerpt">
                  Extrait
                </label>
                <input
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brève description de l’article"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-full flex flex-col">
                <label className="block text-sm font-semibold text-white mb-1" htmlFor="content">
                  Contenu complet
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                  placeholder="Corps complet de l’article"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600/90 text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-indigo-600 transition"
              >
                Générer le code d’article
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/40 bg-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Snippet TypeScript</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/90 text-white px-3 py-2 text-sm font-semibold shadow-md hover:bg-indigo-600 transition"
              >
                Copier
              </button>
            </div>
            <pre className="bg-slate-900/70 text-white rounded-lg p-4 overflow-x-auto text-sm">
              <code>{adminPreview}</code>
            </pre>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
};

export default BlogPage;

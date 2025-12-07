import React, { useEffect, useState } from "react";
import MarketingLayout from "../components/MarketingLayout";
import { blogPosts, type BlogPost } from "../content/blogPosts";
import { updateSeoForArticle, getArticleCanonicalUrl } from "../utils/seo";

const getSlugFromLocation = (): string | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash; // "#/blog?slug=..."
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return null;
  const search = hash.slice(queryIndex + 1);
  const params = new URLSearchParams(search);
  return params.get("slug");
};

const getShareUrl = (post: BlogPost): string => {
  return getArticleCanonicalUrl(`/blog?slug=${encodeURIComponent(post.slug)}`);
};

const BlogPage: React.FC = () => {
  const initialSlug = getSlugFromLocation() ?? (blogPosts[0]?.slug ?? null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);

  const selectedPost =
    blogPosts.find((post) => post.slug === selectedSlug) ?? blogPosts[0];

  useEffect(() => {
    if (!selectedPost) return;
    const url = getShareUrl(selectedPost);
    updateSeoForArticle({
      title: `${selectedPost.title} – Blog Nexus Support Hub`,
      description: selectedPost.excerpt,
      url,
    });
  }, [selectedPost]);

  const handleSelectPost = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== "undefined") {
      window.location.hash = `#/blog?slug=${encodeURIComponent(slug)}`;
      const el = document.getElementById("article-detail");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleShareNative = (post: BlogPost) => {
    const url = getShareUrl(post);
    const text = `${post.title} – Nexus Support Hub`;
    if (navigator.share) {
      navigator
        .share({ title: post.title, text, url })
        .catch(() => undefined);
    }
  };

  const handleCopyLink = async (post: BlogPost) => {
    try {
      const url = getShareUrl(post);
      await navigator.clipboard.writeText(url);
    } catch {
      // silencieux
    }
  };

  return (
    <MarketingLayout>
      <div className="space-y-8">
        <header className="surface-card p-6 lg:p-8 space-y-3 text-center">
          <p className="section-eyebrow">Insights & cas d’usage</p>
          <h1 className="section-title">Blog Nexus Support Hub</h1>
          <p className="section-subtitle max-w-3xl mx-auto">
            Actualités, études de cas et scénarios concrets autour du support assisté par Nexus AI.
          </p>
        </header>

        {/* Grille de cartes – résumé des articles */}
        <section className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl shadow-lg bg-slate-900/60 border border-slate-800 px-6 py-5 flex flex-col gap-3 cursor-pointer hover:border-indigo-500/70"
              onClick={() => handleSelectPost(post.slug)}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPost(post.slug);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/90 text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-indigo-600 transition"
                >
                  Lire l’article complet
                  <span aria-hidden className="text-slate-200">→</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Zone de détail – affiche l’INTÉGRALITÉ de l’article sélectionné */}
        {selectedPost && (
          <section
            id="article-detail"
            className="surface-card rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:p-8 space-y-6"
          >
            <header className="space-y-2">
              <p className="text-sm text-slate-300">
                {selectedPost.city} • {selectedPost.date}
              </p>
              <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                {selectedPost.title}
              </h2>
            </header>

            {/* IMPORTANT : on affiche TOUT le contenu, sans troncature */}
            <article className="prose prose-invert max-w-none text-slate-100">
              {selectedPost.content
                .split("\n\n")
                .filter((block) => block.trim().length > 0)
                .map((block, index) => (
                  <p key={index} className="mb-4 whitespace-pre-line">
                    {block.trim()}
                  </p>
                ))}
            </article>

            {/* CTA orientés client */}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="#/landing"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                Découvrir Nexus Support Hub
              </a>
              <a
                href="#/landing"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
              >
                Demander une démo de Nexus AI
              </a>
            </div>

            {/* Barre de partage */}
            <div className="mt-6 border-t border-slate-700 pt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <span className="font-semibold mr-2">Partager :</span>

              <button
                type="button"
                onClick={() => handleShareNative(selectedPost)}
                className="rounded-full bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
              >
                Partager sur mon appareil
              </button>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  getShareUrl(selectedPost)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
              >
                LinkedIn
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  getShareUrl(selectedPost)
                )}&text=${encodeURIComponent(selectedPost.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
              >
                X (Twitter)
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  selectedPost.title
                )}&body=${encodeURIComponent(getShareUrl(selectedPost))}`}
                className="rounded-full bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
              >
                Email
              </a>

              <button
                type="button"
                onClick={() => handleCopyLink(selectedPost)}
                className="rounded-full bg-slate-800 px-3 py-1.5 hover:bg-slate-700"
              >
                Copier le lien
              </button>
            </div>
          </section>
        )}
      </div>
    </MarketingLayout>
  );
};

export default BlogPage;

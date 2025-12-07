import React, { useEffect } from "react";
import MarketingLayout from "../components/MarketingLayout";
import { blogPosts } from "../content/blogPosts";

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
            Actualités, cas d’usage et analyses autour du support assisté par IA et Nexus AI.
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

              <h2 className="text-xl font-semibold text-white">
                {post.title}
              </h2>

              <p className="text-slate-300 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-800/70 text-slate-200 px-4 py-2 text-sm font-semibold">
                  Article complet disponible dans la documentation Nexus AI.
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </MarketingLayout>
  );
};

export default BlogPage;

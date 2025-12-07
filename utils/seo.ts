export type ArticleSeoParams = {
  title: string;
  description: string;
  url?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function getArticleCanonicalUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const base = window.location.origin;
  return `${base}/#${path}`;
}

export function updateSeoForArticle(params: ArticleSeoParams) {
  if (typeof document === "undefined") return;

  const { title, description, url } = params;
  document.title = title;

  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  if (url) {
    upsertMeta("property", "og:url", url);
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }
  upsertMeta("property", "og:type", "article");
  upsertMeta("name", "twitter:card", "summary_large_image");
}

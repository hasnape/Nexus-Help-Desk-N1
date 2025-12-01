# Configuration des en-têtes de sécurité et du cache

Ce fichier accompagne `vercel.json` et détaille les directives principales à appliquer pour améliorer la note "Bonnes pratiques" (CSP, HSTS, COOP, XFO, Trusted Types) et la mise en cache des assets.

## Sécurité
- **HSTS** : `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` pour forcer TLS.
- **CSP** (YouTube + Supabase + EmailJS) :
  - `default-src 'self'`
  - `script-src 'self' 'wasm-unsafe-eval'` (nécessaire pour Vite/React en prod) ; ajouter des sources spécifiques si besoin.
  - `style-src 'self' 'unsafe-inline'` tant que les styles inline générés par Tailwind/Vite persistent.
  - `img-src 'self' data: https:` et `font-src 'self' data: https:` pour les assets distants.
  - `frame-src https://www.youtube.com https://www.youtube-nocookie.com` pour l’embed de la démo.
  - `connect-src 'self' https://*.supabase.co https://api.emailjs.com` pour Supabase + EmailJS.
  - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'` pour verrouiller l’UI.
  - `upgrade-insecure-requests` pour éviter les mixtes.
  - `require-trusted-types-for 'script'; trusted-types default nexussupporthub` pour activer Trusted Types (peut être passé en `-Report-Only` si nécessaire).
- **Protection additionnelle** : `X-Content-Type-Options=nosniff`, `X-Frame-Options=DENY`, `COOP: same-origin`, `CORP: same-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Cache
- Assets fingerprintés (`/assets`, `/static`, `*.js|*.css|*.woff2|*.png|*.jpg|*.svg`) : `Cache-Control: public, max-age=31536000, immutable`.
- Service worker : `Cache-Control: public, max-age=0, must-revalidate`.
- HTML racine : `Cache-Control: no-store` pour éviter de servir une version obsolète.

Ces en-têtes sont définis dans `vercel.json` afin d’être interprétés automatiquement par Vercel. Adaptez les domaines de `connect-src` si de nouveaux services (analytics, feature flags) sont ajoutés.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Exporter les dossiers en PDF

Les contenus détaillés (deck investisseur, démonstration détaillée, aspects techniques, roadmap et scénarios d’implémentation) sont disponibles au format Markdown dans le dossier `docs/`.

Pour produire des PDF à partager, vous pouvez utiliser un outil externe comme `npx markdown-pdf` ou `npx @marp-team/marp-cli` :

```
npx markdown-pdf docs/investor-deck.md
npx markdown-pdf docs/demo-detaillee.md
npx markdown-pdf docs/aspects-techniques.md
npx markdown-pdf docs/roadmap.md
npx markdown-pdf docs/scenarios-implementation.md
```

Ces commandes ne génèrent pas de binaires dans le dépôt et peuvent être adaptées selon l’outil choisi. Les liens de téléchargement dans l’interface pointent déjà vers les emplacements attendus (`/docs/*.pdf`).

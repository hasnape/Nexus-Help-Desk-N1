# Blocs prêts à coller — Landing Nexus Support Hub

> Objectif : justifier la promesse « Centralisez vos agents, l'IA et les analyses dans un hub conforme RGAA, opérationnel en quelques minutes. » avec des sections courtes, factuelles, + HTML prêt à coller, + modèle de Déclaration d’accessibilité RGAA.

---

## 1) Piliers produit — texte court à copier/coller

### 🧑‍💼 Centralisez vos agents

Comptes agents illimités, rôles & permissions (Admin, Superviseur, Agent).

Routage par files et compétences (skills-based routing) + règles d’escalade.

Boîte partagée, mentions @, macros et réponses enregistrées.

### 🤖 Accélérez avec l’IA

Classement automatique (intention, langue) et priorisation.

Suggestions de réponse et résumés en 1 clic dans les tickets.

Traduction automatique et recherche augmentée dans la base de connaissances.

### 📊 Pilotez par les analyses

Tableaux de bord : SLA, FCR, CSAT, Temps de résolution.

Rapports par canal, par agent, par file, exports CSV/JSON & webhooks.

Alertes KPI (seuils SLA, pics de volume, non‑réponses).

### ♿ Accessibilité (RGAA)

Interface conçue selon le RGAA 4.1 niveau AA : navigation clavier, focus visible, labels ARIA, contrastes ≥ 4,5:1.

Déclaration d’accessibilité publiée + point de contact.

Alternatives textuelles, erreurs formulaires annoncées, pièges clavier évités.

### ⚡ Mise en route en 7 minutes

1. Créez votre espace & invitez vos agents.
2. Connectez un canal (Gmail/Outlook, WhatsApp, Messenger, Chat web).
3. Importez votre FAQ/KB (CSV/Markdown) & activez les réponses IA.

CTA suggérés : Essai gratuit · Voir le guide d’onboarding · Déclaration d’accessibilité

> Astuce : si votre audit RGAA officiel n’est pas encore terminé, utilisez le libellé « conçu selon le RGAA » et ajoutez la mention « audit en cours ».

---

## 2) HTML prêt à coller (accessible & neutre en styles)

```html
<section aria-labelledby="h-agents" class="nsx-section nsx-agents">
  <div class="nsx-container">
    <h2 id="h-agents">Centralisez vos agents</h2>
    <p>Invitez votre équipe, assignez des rôles et organisez les files. Suivez la charge en temps réel.</p>
    <ul>
      <li>Rôles & permissions (Admin, Superviseur, Agent)</li>
      <li>Routage par files et compétences, règles d’escalade</li>
      <li>Boîte partagée, mentions @, macros et réponses enregistrées</li>
    </ul>
  </div>
</section>

<section aria-labelledby="h-ia" class="nsx-section nsx-ai">
  <div class="nsx-container">
    <h2 id="h-ia">Accélérez avec l’IA</h2>
    <p>Classement automatique, suggestions de réponse et résumés en 1 clic dans les tickets.</p>
    <ul>
      <li>Détection d’intention & de langue, priorisation</li>
      <li>Suggestions de réponse et résumés en 1 clic</li>
      <li>Traduction automatique, recherche augmentée KB</li>
    </ul>
  </div>
</section>

<section aria-labelledby="h-analytics" class="nsx-section nsx-analytics">
  <div class="nsx-container">
    <h2 id="h-analytics">Pilotez par les analyses</h2>
    <p>Visualisez vos SLA, FCR, CSAT et temps de résolution. Exportez ou connectez vos outils BI.</p>
    <ul>
      <li>Dashboards par canal / file / agent</li>
      <li>Exports CSV/JSON et webhooks</li>
      <li>Alertes KPI (seuils SLA, pics de volume)</li>
    </ul>
  </div>
</section>

<section aria-labelledby="h-access" class="nsx-section nsx-access">
  <div class="nsx-container">
    <h2 id="h-access">Accessibilité & conformité RGAA</h2>
    <p>Interface conçue selon le RGAA 4.1 niveau AA : navigation clavier, lecteurs d’écran (ARIA), contrastes vérifiés.</p>
    <ul>
      <li>Focus visible, skip‑links et ordre de tabulation logique</li>
      <li>Labels associés aux champs, messages d’erreur reliés par <code>aria-describedby</code></li>
      <li>Images avec <code>alt</code> pertinent, alternatives pour les médias</li>
    </ul>
    <p>
      <a href="/accessibilite" class="nsx-link">Déclaration d’accessibilité</a>
      <span aria-hidden="true"> · </span>
      <a href="/contact" class="nsx-link">Point de contact accessibilité</a>
    </p>
  </div>
</section>

<section aria-labelledby="h-setup" class="nsx-section nsx-setup">
  <div class="nsx-container">
    <h2 id="h-setup">Mise en route en 7 minutes</h2>
    <ol>
      <li><strong>Créez</strong> votre espace et invitez vos agents.</li>
      <li><strong>Connectez</strong> un canal (Gmail/Outlook, WhatsApp, Messenger, Chat web).</li>
      <li><strong>Importez</strong> votre FAQ/KB (CSV/Markdown) & activez l’IA.</li>
    </ol>
    <div class="nsx-actions" role="group" aria-label="Actions d’onboarding">
      <a class="nsx-btn" href="/signup">Essai gratuit</a>
      <a class="nsx-btn nsx-btn-secondary" href="/guide-onboarding">Voir le guide</a>
    </div>
  </div>
</section>
```

> Les classes nsx-* sont neutres : stylez-les avec votre CSS existant (Bootstrap/Tailwind/vanilla). Les balises et attributs ARIA sont pensés pour un parcours clavier + lecteur d’écran.

---

## 3) Déclaration d’accessibilité — modèle (RGAA 4.1 AA)

**Nexus Support Hub — Déclaration d’accessibilité**

Organisation responsable : Rép&Web — 10 Grande Rue de Saint‑Clair, 69300 — contact : repweb.69@laposte.net

Adresse du service : https://nexussupporthub.eu

### État de conformité

Le service est (à choisir : conforme / partiellement conforme / non conforme) au RGAA 4.1 niveau AA.

Dernière évaluation : (date d’audit) par (nom de l’auditeur / interne).

### Résultats des tests

Taux de conformité : (xx %) des critères applicables respectés.

Pages et composants testés : (liste des pages / composants clés).

### Contenus non accessibles

(Décrire) : ex. contrastes insuffisants sur certains badges de statut ; nom accessible de l’icône X manquant ; focus non visible sur (composant).

Dérogations : le cas échéant, justification et alternative fournie.

### Alternatives proposées

Version texte pour (graphiques) ; transcriptions / sous‑titres pour (vidéos) ; lien vers contenu équivalent.

### Technologies utilisées

HTML5, WAI‑ARIA 1.2, CSS, JavaScript (framework : React/Vite/…), lecteurs d’écran (NVDA/JAWS/VoiceOver), navigateurs (Chrome/Firefox/Safari/Edge).

### Amélioration et contact

Si vous ne parvenez pas à accéder à un contenu ou à un service, contactez‑nous : repweb.69@laposte.net ou via /contact.

Nous nous engageons à vous répondre sous (x jours ouvrés).

### Voies de recours

Si la réponse n’est pas satisfaisante, vous pouvez saisir le Défenseur des droits : https://www.defenseurdesdroits.fr/

Document mis à jour le : (date).

---

## 4) Checklist RGAA — Dev & Contenu (à cocher avant publication)

### Structure & navigation

- [ ] Ordre de tabulation logique ; aucun piège clavier.
- [ ] Skip‑link « Aller au contenu » en début de page.
- [ ] Titres hiérarchisés (h1 → h2 → h3), un seul h1 par page.

### Formulaires

- [ ] Chaque champ a un label associé ; erreurs reliées via aria-describedby.
- [ ] Messages d’erreur clairs, persistants, non‑couleur‑dépendants.
- [ ] Zones obligatoires signalées textuellement (pas seulement par couleur).

### Composants interactifs

- [ ] États focus visibles ; boutons et liens ≥ 44×44 px en cible tactile.
- [ ] Rôles/états ARIA pertinents (aria-expanded, aria-current, etc.).
- [ ] Pas de contenu animé clignotant > 3 fois par seconde.

### Médias & images

- [ ] `alt` descriptif (sauf décoratives `alt=""`).
- [ ] Sous‑titres/transcriptions pour vidéos & audio.

### Couleurs & contrastes

- [ ] Contraste texte normal ≥ 4,5:1 ; gros texte ≥ 3:1.
- [ ] Contraste des éléments interactifs (bordures, icônes, focus) suffisant.

### Contenu & langue

- [ ] Langue de page (`lang="fr"`) et de fragments changée si besoin.
- [ ] Liens explicites (« Voir le guide d’onboarding » plutôt que « Cliquez ici »).

### Technique

- [ ] HTML valide ; pas de `tabindex` positif ; éléments interactifs au clavier.
- [ ] Titres de page uniques ; ordre DOM cohérent avec l’affichage visuel.

---

## 5) Preuves visuelles à prévoir sur la landing

1. Capture tableau de bord agents (rôles, files, routage).
2. GIF IA en action (suggestion de réponse + résumé en 1 clic).
3. Capture Dashboard KPI (SLA, FCR, CSAT).
4. Bloc Accessibilité (pictos/clavier/lecteur d’écran) + lien « Déclaration d’accessibilité ».
5. Encart Onboarding 7 minutes avec une checklist visuelle + logos d’intégrations (Gmail/Outlook/WhatsApp/Chat).

---

### Note d’usage

Si le time‑to‑value réel dépasse 7 minutes, remplacez par « opérationnel rapidement (guide pas‑à‑pas) » ou « en moins de 30 minutes ».

Dès que l’audit RGAA est finalisé, mettez à jour la Déclaration (date, taux, pages testées) et remplacez « conçu selon » par « conforme » si applicable.


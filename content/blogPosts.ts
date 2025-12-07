export type BlogPost = {
  slug: string;
  title: string;
  city: string;
  date: string;
  excerpt: string;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "reduire-tickets-n1-40-pourcent",
    title: "Comment réduire 40 % des tickets N1 sans embaucher ?",
    city: "Paris",
    date: "21 janvier 2025",
    excerpt:
      "Comment configurer l’IA Nexus pour absorber les demandes récurrentes et libérer vos agents N2 dès la première semaine.",
    content:
      "Nexus Support Hub peut être configuré pour répondre automatiquement aux questions récurrentes : accès Wi-Fi, réinitialisation de mot de passe, FAQ. En cadrant les intentions les plus fréquentes et en connectant vos procédures existantes, la plateforme réduit la charge N1 sans devoir recruter davantage.",
  },
  {
    slug: "help-desk-multilingue",
    title: "Mettre en place un help desk FR / EN / AR en moins d’une semaine",
    city: "Lyon",
    date: "14 février 2025",
    excerpt:
      "Les étapes clés pour déployer Nexus dans trois langues, sans recruter d’équipe supplémentaire ni modifier vos outils internes.",
    content:
      "Grâce à l’orchestration multilingue intégrée, Nexus Support Hub gère les requêtes en français, anglais et arabe dès le premier jour. Les réponses sont harmonisées et les agents disposent d’un contexte traduit automatiquement, ce qui réduit drastiquement le temps de traitement.",
  },
  {
    slug: "faq-optimisee-ia",
    title: "Organiser sa FAQ pour que l’IA Nexus réponde mieux",
    city: "Casablanca",
    date: "3 mars 2025",
    excerpt:
      "Structurer vos articles, procédures et captures d’écran pour maximiser la pertinence des réponses générées par l’IA Nexus.",
    content:
      "Une FAQ efficace repose sur des articles courts, structurés et bien balisés. En indiquant clairement les prérequis, les étapes et les cas limites, Nexus peut générer des réponses fiables et prêtes à l’emploi pour vos utilisateurs.",
  },
  {
    slug: "n1-vers-n2-preparer-agents",
    title: "N1 → N2 : préparer vos agents avec des tickets déjà résumés",
    city: "Toulouse",
    date: "19 mars 2025",
    excerpt:
      "Comment transmettre aux agents N2 des tickets contextualisés, priorisés et résumés automatiquement dès leur création.",
    content:
      "En s’appuyant sur votre historique de tickets et vos règles métier, Nexus génère des résumés exploitables pour les agents N2. Les priorités sont mises en avant et le contexte est enrichi par les échanges précédents, ce qui accélère la résolution.",
  },
];

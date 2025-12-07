export type BlogPost = {
  slug: string;
  title: string;
  city: string;
  date: string;     // ex: "12 mars 2025"
  excerpt: string;  // court résumé pour les cartes
  content: string;  // texte complet de l’article
};

export const blogPosts: BlogPost[] = [
  {
    slug: "nexus-ai-revolution-support-client-it",
    title: "Nexus Support Hub : L’Intelligence Artificielle Nexus Redéfinit l’Efficacité du Support",
    city: "Paris",
    date: "12 mars 2025",
    excerpt:
      "Nexus Support Hub transforme le support de Niveau 1 en un véritable centre de valeur, grâce à Nexus AI, une IA enrichie par vos propres procédures et FAQ.",
    content: `📍 Paris, 12 mars 2025 – La gestion du support de Niveau 1 (L1) est devenue un point de friction pour de nombreuses organisations, les équipes étant noyées sous les requêtes répétitives (mots de passe, procédures simples). Face à cette inefficacité, le Nexus Support Hub propose une rupture technologique, transformant le support en un véritable centre de valeur et d'agilité.

Le Nexus AI : Votre Solution Sur Mesure pour le Niveau 1
Le cœur de cette transformation est l'Intelligence Artificielle Nexus (Nexus AI). S'appuyant sur des modèles de pointe (tels que Gemini), cette IA a été formatée et enrichie avec votre logique métier et vos procédures internes spécifiques, ce qui en fait votre solution propriétaire.

Le Nexus AI est capable de :
- Prendre en charge et résoudre la majorité des demandes L1 de manière autonome et instantanée 24/7.
- Offrir un support fluide et cohérent en Français, Anglais et Arabe.

Cette automatisation libère vos experts, leur permettant de se concentrer sur les défis stratégiques plutôt que sur la gestion des tickets routiniers.

Assistance L2 : Quand l'Humain et l'IA Collaborent
Lorsqu'un problème nécessite l'intervention d'un agent humain (Niveau 2), l'IA Nexus ne se contente pas de transférer le ticket ; elle l'optimise. Chaque requête escaladée arrive chez l'agent déjà résumée, classifiée et priorisée. Ce gain de temps sur la qualification est crucial et permet d'accélérer considérablement le temps de résolution.

Un Tableau de Bord Conçu pour le Manager
Le Nexus Support Hub se distingue par ses outils de gestion puissants, offrant aux managers un contrôle total sur leur écosystème de support :

- Gestion Autonome de la Connaissance : Les responsables peuvent directement ajouter, gérer et mettre à jour leurs propres procédures et FAQ via le tableau de bord. L'IA apprend et applique immédiatement ces modifications, assurant que le support est toujours aligné sur la réalité de l'entreprise.
- Suivi en Temps Réel : Des tableaux de bord dédiés fournissent une vue immédiate de la consommation de tickets et des performances, facilitant la prise de décision data-driven et l'optimisation des ressources.
- Expérience Client Enrichie : La plateforme améliore la satisfaction client en offrant la possibilité de proposer ou de prendre des rendez-vous avec un agent, et permet la personnalisation de l'interface de connexion et de chat pour respecter la charte graphique de l'entreprise.

Sécurisé, multilingue et inspiré par les pratiques d'accessibilité (RGAA 4.1), le Nexus Support Hub est l'outil indispensable pour toute organisation qui souhaite transformer son support en un moteur d'efficacité.

Contactez-nous pour une démonstration et découvrez la puissance du Nexus AI au service de votre productivité.`,
  },
];

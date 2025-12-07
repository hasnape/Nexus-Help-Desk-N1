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
    slug: "moins-de-tickets-plus-de-temps",
    title: "Moins de tickets répétitifs, plus de temps pour les vrais problèmes",
    city: "Paris",
    date: "21 janvier 2025",
    excerpt:
      "Nexus Support Hub veut décharger les équipes N1 des tickets répétitifs et mieux préparer le travail du N2, en combinant IA, base de connaissance et tableaux de bord dédiés.",
    content: `📍 Paris, 21 janvier 2025 – Dans de nombreuses entreprises, le scénario est connu : les équipes de support croulent sous les demandes de premier niveau – mots de passe oubliés, accès bloqués, procédures déjà documentées – tandis que les incidents critiques attendent. Une jeune plateforme, Nexus Support Hub, essaie de changer cette équation en s’appuyant sur l’IA et une organisation du support plus structurée.

Une promesse simple : décharger le N1 sans embaucher
Nexus Support Hub se présente comme un “centre d’assistance intelligent” : l’outil combine une base de connaissance, un assistant IA et un système de tickets classique. L’objectif déclaré est clair : réduire le volume de tickets N1 traités par les équipes humaines et améliorer la préparation des dossiers transmis au N2.

Concrètement, l’utilisateur final – salarié, client ou étudiant – ouvre un ticket dans l’espace Nexus de son organisation. Avant même de solliciter un agent, la plateforme interroge la FAQ et les procédures internes de l’entreprise. Si une réponse fiable existe, l’assistant IA la reformule et la propose immédiatement, en français, anglais ou arabe.

Lorsque la demande est trop complexe pour une résolution automatique, le ticket est tout de même pris en charge par l’IA : il est résumé, catégorisé (mot de passe, accès, matériel, logiciel, etc.) et priorisé avant d’arriver dans la file d’attente des agents.

Un espace dédié par entreprise, pas un help desk mutualisé
Sur un marché où le terme “multi-entreprises” peut inquiéter, Nexus insiste sur la séparation stricte des données. Chaque client dispose de son propre espace de support, avec sa base de connaissance, ses rôles (manager, agent, utilisateur), ses règles et ses statistiques. Techniquement, la plateforme s’appuie sur PostgreSQL et Supabase avec des règles de sécurité RLS pour empêcher la fuite d’informations d’une entreprise à l’autre.

FAQ d’abord, IA ensuite : une approche pragmatique
Au cœur du dispositif, la FAQ d’entreprise fait office de première ligne de défense. Les managers peuvent créer des entrées de connaissance structurées : question, réponse, tags, langue. Ces contenus servent ensuite de base à l’assistant IA, qui va rechercher, comparer et adapter les réponses au contexte de la demande.

L’IA répond quand c’est possible, puis génère un ticket complet quand l’intervention d’un agent est nécessaire : résumé, catégorie, priorité, historique des essais déjà effectués. Résultat : moins de temps passé à relire des mails bruts, davantage de temps consacré à la résolution.

Des rôles bien séparés pour organiser le travail
Le produit s’articule autour de trois profils :
– Manager : crée l’espace de l’entreprise, configure le plan, gère la FAQ, invite les agents et suit les statistiques.
– Agent : traite les tickets escaladés, échange avec les utilisateurs et enrichit la base de connaissance.
– Utilisateur : crée des tickets, suit l’avancement des demandes et discute avec l’assistant IA.

Cette séparation des rôles permet d’introduire la plateforme aussi bien dans une petite PME qu’au sein d’un service client structuré ou d’un établissement de formation.

Accessibilité et multilinguisme comme arguments d’adoption
La plateforme revendique une interface inspirée des bonnes pratiques d’accessibilité numérique (navigation au clavier, contrastes adaptés, compatibilité lecteurs d’écran), dans l’esprit du référentiel RGAA 4.1. Côté langues, Nexus propose dès le départ le français, l’anglais et l’arabe, un point clé pour les organisations réparties sur plusieurs zones géographiques.

Vers un support plus stratégique
Derrière la promesse “moins de tickets répétitifs, plus de temps pour les vrais problèmes”, Nexus Support Hub propose de faire du support un levier de performance plutôt qu’un simple centre de coûts. En automatisant une partie du N1 et en structurant mieux le N2, la plateforme veut redonner du temps aux équipes pour les incidents qui comptent vraiment : pannes critiques, projets d’amélioration, accompagnement des utilisateurs.`,
  },
  {
    slug: "nexus-ai-redefinit-le-support",
    title: "Nexus Support Hub : l’Intelligence Artificielle Nexus redéfinit l’efficacité du support",
    city: "Alger",
    date: "5 avril 2025",
    excerpt:
      "Avec Nexus AI, le Nexus Support Hub automatise la majorité du support N1 et prépare les équipes N2 avec des tickets déjà résumés, classifiés et priorisés.",
    content: `📍 Alger, 5 avril 2025 – La gestion du support de Niveau 1 (L1) est devenue un point de friction pour de nombreuses organisations, les équipes étant noyées sous les requêtes répétitives (mots de passe, procédures simples). Face à cette inefficacité, le Nexus Support Hub propose une rupture technologique, transformant le support en un véritable centre de valeur et d’agilité.

Le Nexus AI : votre solution sur mesure pour le Niveau 1
Le cœur de cette transformation est l’Intelligence Artificielle Nexus (Nexus AI). S’appuyant sur des modèles de pointe tels que Gemini, cette IA est enrichie avec la logique métier et les procédures internes de chaque client, ce qui en fait une solution propriétaire adaptée à chaque organisation.

Nexus AI est capable de :
– prendre en charge et résoudre la majorité des demandes L1 de manière autonome et instantanée, 24/7 ;
– offrir un support fluide et cohérent en français, anglais et arabe.

Cette automatisation libère les experts, qui peuvent se concentrer sur les défis stratégiques plutôt que sur la gestion des tickets routiniers.

Assistance L2 : quand l’humain et l’IA collaborent
Lorsqu’un problème nécessite l’intervention d’un agent humain (Niveau 2), Nexus AI ne se contente pas de transférer le ticket : il l’optimise. Chaque requête escaladée arrive déjà résumée, classifiée et priorisée. Ce gain de temps sur la qualification est crucial et permet d’accélérer considérablement les délais de résolution.

Un tableau de bord conçu pour le manager
Le Nexus Support Hub se distingue par ses outils de gestion :
– Gestion autonome de la connaissance : les responsables ajoutent et mettent à jour leurs propres procédures et FAQ depuis le tableau de bord. L’IA apprend et applique immédiatement ces modifications.
– Suivi en temps réel : des indicateurs dédiés montrent la consommation de tickets, les volumes par priorité et la performance des équipes.
– Expérience client enrichie : la plateforme permet de proposer ou prendre des rendez-vous avec un agent et de personnaliser l’interface (connexion, chat) à la charte graphique de l’entreprise.

Sécurisé, multilingue et inspiré par les pratiques d’accessibilité (RGAA 4.1), le Nexus Support Hub se positionne comme un outil clé pour les organisations qui souhaitent transformer leur support en moteur d’efficacité.

Prochaine étape : contacter l’équipe Nexus pour une démonstration et mesurer concrètement l’impact du Nexus AI sur la productivité des équipes de support.`,
  },
  {
    slug: "revolution-support-client-it-nexus-ai",
    title: "Nexus Support Hub : l’Intelligence Artificielle Nexus redéfinit l’efficacité du support client et IT",
    city: "Lyon",
    date: "12 septembre 2025",
    excerpt:
      "Avec Nexus AI, le Nexus Support Hub transforme le support L1 en moteur d’efficacité, tout en donnant aux managers un contrôle complet sur la connaissance et les performances.",
    content: `📍 Lyon, 12 septembre 2025 – La gestion du support de Niveau 1 (L1) est devenue un point de friction pour de nombreuses organisations, les équipes étant noyées sous les requêtes répétitives (mots de passe, procédures simples). Face à cette inefficacité, le Nexus Support Hub propose une rupture technologique, transformant le support en un véritable centre de valeur et d’agilité.

Le Nexus AI : Votre Solution Sur Mesure pour le Niveau 1
Le cœur de cette transformation est l'Intelligence Artificielle Nexus (Nexus AI). S'appuyant sur des modèles de pointe (tels que Gemini), cette IA a été formatée et enrichie avec votre logique métier et vos procédures internes spécifiques, ce qui en fait votre solution propriétaire.

Le Nexus AI est capable de :

Prendre en charge et résoudre la majorité des demandes L1 de manière autonome et instantanée 24/7.

Offrir un support fluide et cohérent en Français, Anglais et Arabe.

Cette automatisation libère vos experts, leur permettant de se concentrer sur les défis stratégiques plutôt que sur la gestion des tickets routiniers.

Assistance L2 : Quand l'Humain et l'IA Collaborent
Lorsqu'un problème nécessite l'intervention d'un agent humain (Niveau 2), l'IA Nexus ne se contente pas de transférer le ticket ; elle l'optimise. Chaque requête escaladée arrive chez l'agent déjà résumée, classifiée et priorisée. Ce gain de temps sur la qualification est crucial et permet d'accélérer considérablement le temps de résolution.

Un Tableau de Bord Conçu pour le Manager
Le Nexus Support Hub se distingue par ses outils de gestion puissants, offrant aux managers un contrôle total sur leur écosystème de support :

Gestion Autonome de la Connaissance : Les responsables peuvent directement ajouter, gérer et mettre à jour leurs propres procédures et FAQ via le tableau de bord. L'IA apprend et applique immédiatement ces modifications, assurant que le support est toujours aligné sur la réalité de l'entreprise.

Suivi en Temps Réel : Des tableaux de bord dédiés fournissent une vue immédiate de la consommation de tickets et des performances, facilitant la prise de décision data-driven et l'optimisation des ressources.

Expérience Client Enrichie : La plateforme améliore la satisfaction client en offrant la possibilité de proposer ou de prendre des rendez-vous avec un agent, et permet la personnalisation de l'interface de connexion et de chat pour respecter la charte graphique de l'entreprise.

Sécurisé, multilingue et inspiré par les pratiques d'accessibilité (RGAA 4.1), le Nexus Support Hub est l'outil indispensable pour toute organisation qui souhaite transformer son support en un moteur d'efficacité.

Contactez-nous pour une démonstration et découvrez la puissance du Nexus AI au service de votre productivité.`,
  },
];

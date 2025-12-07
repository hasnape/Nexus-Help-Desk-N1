# Nexus Support Hub – Présentation actualisée

## Vision
Nexus Support Hub fournit un help desk multi-entreprises qui automatise le support de niveau 1 (L1) et assiste le niveau 2 (L2) en français, anglais et arabe. L’architecture repose sur Supabase/PostgreSQL avec des règles RLS pour isoler chaque company_id, et une interface inspirée du RGAA 4.1 pour l’accessibilité.

## Capacités clés
- **Automatisation L1 par IA (Gemini)** : réponses immédiates, création de tickets enrichis et priorisés.
- **Assistance L2** : résumés IA, contexte structuré et historique prêt pour les agents.
- **Base de connaissances par entreprise** : FAQ, procédures, macros; l’IA consulte en priorité ces contenus.
- **Portails dédiés** : tableaux de bord Manager, Agent et Utilisateur avec rôles distincts; portail spécialisé Lai & Turner pour la gestion juridique (tickets, rendez-vous, base de connaissances).
- **Rendez-vous liés aux tickets** : création et audit des appointments avec suivi d’historique.
- **Plans et quotas** : Freemium, Standard, Pro (jusqu’à 1000 tickets/mois ou illimité) avec affichage des tickets restants et % utilisé.
- **Multilingue et accessibilité** : FR / EN / AR nativement, contrastes vérifiés, navigation clavier et options voix (reconnaissance et synthèse).

## Parcours utilisateur
1. **Portail utilisateur** : création et suivi des tickets, échanges avec l’agent, appels IA qui s’appuient sur la FAQ.
2. **Espace agent** : file de tickets assignés ou disponibles, résumés IA, notes internes et rendez-vous associés.
3. **Espace manager** : visibilité sur tickets, quotas/plans, équipes et ressources (FAQ, base de connaissance).
4. **Portail Lai & Turner** : branding dédié et flux métier pour le cabinet d’avocats (intake, tickets juridiques, rendez-vous).

## Sécurité & gouvernance
- **Isolation stricte** par company_id via RLS Supabase.
- **Rôles internes** : manager, agent, user; **rôles plateforme** : super_admin, support, tenant_admin.
- **Traçabilité** : audit des tickets et rendez-vous, historisation des conversations IA.

## Offre et déploiement
- **Freemium** : volume mensuel limité pour démarrer rapidement.
- **Standard / Pro** : jusqu’à 1000 tickets/mois ou illimité selon besoin.
- **Mise en route rapide** : création d’un espace, invitation de l’équipe, import de la FAQ, activation du chat IA.

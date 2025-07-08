# Nexus Support Hub

Une plateforme moderne de support client avec assistant IA conversationnel, conçue pour les entreprises de toutes tailles.

## 🚀 Fonctionnalités Principales

### Assistant IA Conversationnel

- Chat intelligent avec l'IA Nexus basée sur Google Gemini
- Création automatique de tickets avec historique complet des conversations
- Catégorisation et priorisation intelligente des tickets

### Architecture Multi-Entreprises

- Isolation complète des données par entreprise
- Gestion des rôles : Utilisateur, Agent, Manager
- Tableaux de bord adaptés à chaque rôle

### Fonctionnalités Modernes

- Interface multilingue (Français, Anglais, Arabe)
- Commandes vocales (navigateurs compatibles)
- Design responsive pour tous les appareils
- Authentification sécurisée avec Supabase

## 🛠️ Technologies Utilisées

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Base de données + Authentification)
- **IA**: Google Gemini API
- **Styling**: Tailwind CSS
- **Architecture**: Multi-tenant avec Row Level Security (RLS)

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- Compte Supabase
- Clé API Google Gemini

## 🚀 Installation et Configuration

1. **Cloner le repository**

   ```bash
   git clone [repository-url]
   cd nexus-support-hub
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**

   Créer un fichier `.env.local` avec :

   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
   VITE_GEMINI_API_KEY=votre_cle_api_gemini
   ```

4. **Configuration de la base de données**

   Exécuter les scripts SQL fournis dans Supabase pour créer :

   - Tables (companies, users, tickets)
   - Politiques RLS
   - Fonctions et triggers

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🏗️ Structure du Projet

```
src/
├── components/          # Composants réutilisables
├── contexts/           # Contextes React (Auth, Language, Sidebar)
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── services/           # Services (Supabase, Gemini)
├── locales/           # Fichiers de traduction
└── types.ts           # Types TypeScript
```

## 🔒 Sécurité

- **Authentification**: Supabase Auth avec JWT
- **Isolation des données**: Row Level Security (RLS)
- **Chiffrement**: HTTPS/TLS pour toutes les communications
- **Validation**: Validation côté client et serveur

## 📊 Plans Tarifaires

### Freemium (Gratuit)

- Jusqu'à 3 agents
- 200 tickets par mois
- Chat IA avec création de tickets
- Support par email

### Standard (10€/agent/mois)

- Agents illimités
- Tickets illimités
- Chat IA avec historique complet
- Support prioritaire

### Pro (20€/agent/mois)

- Toutes les fonctionnalités Standard
- Commandes vocales
- Planification de rendez-vous
- Rapports détaillés

## 🤝 Rôles Utilisateur

### Utilisateur

- Créer des tickets via chat IA
- Suivre ses tickets
- Communiquer avec les agents

### Agent

- Voir tickets non assignés
- Prendre en charge des tickets
- Communiquer avec les utilisateurs
- Mettre à jour le statut des tickets

### Manager

- Vue d'ensemble de tous les tickets
- Assigner/réassigner des tickets
- Gérer les utilisateurs de l'entreprise
- Accès aux rapports et statistiques

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev          # Lancer en mode développement
npm run build        # Construire pour la production
npm run preview      # Prévisualiser la version de production
npm run lint         # Linter le code
```

### Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou assistance :

- Email : hubnexusinfo@gmail.com
- Documentation : Accessible via l'application
- Manuel utilisateur : Intégré dans la plateforme

## 📝 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 🔄 Roadmap

### Prochaines fonctionnalités

- API publique pour intégrations
- Webhooks pour automatisations
- Analyse de sentiment
- Intégration email-to-ticket
- Rapports avancés

### Améliorations continues

- Performance de l'IA
- Interface utilisateur
- Sécurité
- Scalabilité

---

**Nexus Support Hub** - Plateforme moderne de support client avec transparence et fiabilité.

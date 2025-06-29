# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev `

// fonctionnalités (si vous souhaitez continuer le développement)
En tant que votre ingénieur senior, voici quelques fonctionnalités que je recommanderais pour rendre le Nexus Support Hub encore plus puissant et attractif :
Analyses par l'IA pour les Managers : Nous pourrions créer une nouvelle section dans le tableau de bord du manager. L'IA pourrait y analyser l'ensemble des tickets résolus pour identifier des problèmes récurrents. Par exemple, elle pourrait générer un rapport comme : "35% des problèmes matériels ce mois-ci concernaient des 'souris défectueuses' pour le modèle de poste X." Cela fournirait des informations très précieuses pour prendre des décisions stratégiques.
Génération d'une Base de Connaissances : Après la résolution d'un ticket, l'agent ou le manager pourrait cliquer sur un bouton "Ajouter à la base de connaissances". L'IA prendrait alors la conversation et les étapes de résolution pour rédiger un article de FAQ (Foire Aux Questions) propre et anonyme. Cela aiderait les autres utilisateurs à résoudre leurs problèmes eux-mêmes, réduisant le nombre de tickets.
Sondages de Satisfaction Client (CSAT) : Après qu'un ticket est marqué comme "Résolu", nous pourrions automatiquement envoyer un message simple à l'utilisateur : "Comment évalueriez-vous le support que vous avez reçu ? (👍 Bon / 😐 Neutre / 👎 Mauvais)". Nous pourrions ensuite afficher ces scores de satisfaction sur le tableau de bord du manager.
Notifications : Pour rendre l'application plus réactive, nous pourrions intégrer des notifications par e-mail ou même des notifications "push" dans le navigateur. Celles-ci pourraient alerter les utilisateurs et les agents lorsqu'un ticket est mis à jour, ou lorsqu'un nouveau ticket est assigné.
3. Amélioration de l'Expérience Utilisateur (UX)
Mode Sombre (Dark Mode) : C'est une fonctionnalité très populaire et souvent demandée par les utilisateurs. C'est relativement simple à mettre en œuvre avec la configuration actuelle (Tailwind CSS) et ce serait un excellent ajout esthétique.
Amélioration de l'Accueil des Nouveaux Utilisateurs (Onboarding) : Nous pourrions affiner la fenêtre de bienvenue pour les nouveaux managers avec une mini-visite guidée interactive des fonctionnalités clés de leur tableau de bord..

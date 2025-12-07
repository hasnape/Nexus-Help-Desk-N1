# Kit de tests fonctionnels – Nexus Support Hub

## 1. Contexte
Nexus Support Hub est une plateforme de help desk multi-entreprises. Trois rôles principaux (Manager, Agent, User) cohabitent, avec un portail dédié pour l’entreprise **Lai & Turner** qui reproduit le flux de tickets côté clients externes.

## 2. Pré-requis de test
1. Disposer d’un environnement Supabase configuré avec la base Nexus (URL + clé service prêtes si besoin d’appels directs).
2. Avoir au moins une entreprise **Freemium** (ex. GOODTIME) et une entreprise **Pro** (ex. LAI & TURNER) actives.
3. Disposer d’au moins un compte **Manager**, **Agent** et **User** pour au moins une entreprise (création possible via interface Manager si autorisé).
4. Utiliser un navigateur récent (Chrome ou Edge recommandé) et une connexion réseau stable.
5. (Optionnel) Préparer le script `scripts/sql/healthcheck_nexus_tickets.sql` pour valider la cohérence des données après les parcours.

## 3. Scénarios de test – Auth / Rôles
1. **Login Manager**
   - Étapes : ouvrir l’application, cliquer sur « Se connecter », entrer l’email et le mot de passe Manager, valider.
   - Attendus : tableau de bord Manager affiché (workspace par entreprise), menus Agent/User absents.
2. **Login Agent**
   - Étapes : répéter la connexion avec un compte Agent.
   - Attendus : tableau de bord Agent affiché, pas d’accès aux actions d’administration Manager.
3. **Login User**
   - Étapes : se connecter en User via le portail standard.
   - Attendus : espace User seulement (création/suivi de ses tickets), pas d’accès aux écrans Manager/Agent.
4. **Visibilité croisée**
   - Étapes : tenter d’ouvrir une URL Manager/Agent depuis une session User (et inversement).
   - Attendus : redirection ou message d’erreur bloquant ; aucune donnée sensible affichée.

## 4. Scénarios de test – Tickets
1. **Création côté User (Nexus classique)**
   - Étapes : connecté en User, créer un ticket (titre + description) puis valider.
   - Attendus : ticket visible dans la liste User avec statut **Open** et horodatage correct.
2. **Création côté portail Lai & Turner (si actif)**
   - Étapes : via le portail dédié, créer un ticket similaire.
   - Attendus : ticket rattaché à l’entreprise Lai & Turner (company_id/nom correct), visible côté Manager.
3. **Vérifications côté Manager**
   - Étapes : connecté en Manager, ouvrir le workspace de l’entreprise concernée.
   - Attendus : ticket présent dans la vue, compteurs « Tickets totaux » et « Tickets restants ce mois-ci » mis à jour.
4. **Prise en charge par un Agent**
   - Étapes : en Agent, ouvrir le ticket, l’assigner/prendre en charge, changer le statut **Open → InProgress → Resolved**.
   - Attendus : statut synchronisé et visible côté User et Manager ; historique cohérent.
5. **Suppression par un Manager**
   - Étapes : en Manager, supprimer un ticket récemment créé.
   - Attendus : disparition immédiate du dashboard, compteur « Tickets totaux » décrémenté, quota « Tickets restants ce mois-ci » cohérent (pas de décrément inattendu de la part « used »).

## 5. Scénarios de test – Messages
1. **Messages Agent**
   - Étapes : en Agent, poster un message public dans le fil du ticket.
   - Attendus : message visible côté Agent et Manager ; côté User si prévu par la configuration.
2. **Messages User**
   - Étapes : en User, répondre au ticket.
   - Attendus : message visible côté Agent et Manager, ordre chronologique respecté.
3. **RLS / isolement des entreprises**
   - Étapes : copier l’URL d’un ticket entreprise A, tenter de l’ouvrir en étant connecté sur entreprise B (ou User d’une autre entreprise).
   - Attendus : accès refusé ou redirection ; aucune donnée du ticket entreprise A ne fuit.

## 6. Scénarios de test – Quotas & plans
1. **Atteindre le quota Freemium**
   - Étapes : pour l’entreprise Freemium, créer des tickets jusqu’à atteindre ou dépasser le quota mensuel.
   - Attendus : comportement clair (refus explicite, blocage ou message d’erreur front). Noter le message exact.
2. **Affichage du pourcentage utilisé**
   - Étapes : en Manager, consulter le tableau de bord.
   - Attendus : pourcentage/compteur de quota mis à jour après chaque création.
3. **Effet de la suppression sur le quota**
   - Étapes : supprimer un ticket Freemium après dépassement ou proximité du quota.
   - Attendus : le compteur « used » ne doit pas augmenter (ou consigner le comportement actuel si différent), le nombre de tickets visibles diminue.

## 7. Scénarios de test – Rendez-vous (Appointments)
1. **Création**
   - Étapes : si la table `appointment_details` est utilisée, depuis l’interface Manager ou Agent, ajouter un rendez-vous (date, heure, note) sur un ticket actif.
   - Attendus : rendez-vous listé dans la fiche ticket avec l’horaire correct.
2. **Reschedule / Suppression**
   - Étapes : modifier l’horaire ou supprimer le rendez-vous.
   - Attendus : mise à jour visuelle immédiate ; exécuter ensuite le script SQL de healthcheck pour vérifier la ligne correspondante (présente/absente et `ticket_id` correct).

## 8. Check de régression rapide
À réaliser après toute modification majeure (durée cible : < 10 minutes) :
1. Connexion Manager (tableau de bord accessible, pas d’erreur UI).
2. Création d’un ticket côté User (statut **Open** visible côté User et Manager).
3. Suppression d’un ticket côté Manager (disparition + compteurs à jour).
4. Envoi d’un message côté Agent (visible dans le fil de discussion).
5. Vérification du quota utilisé sur le tableau de bord Manager (valeur cohérente avec les actions précédentes).

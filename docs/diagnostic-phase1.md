# Diagnostic Phase 1 – Tickets lifecycle and Supabase interactions

## 1) Résumé global
- `App.tsx` centralise le contexte via `AppProviderContent`, expose les actions tickets (création, statut, assignation, messages, rendez-vous, suppression) et gère le stockage des chats (embedded vs `ticket_messages`).
- Les pages de tableaux de bord (Nexus et Lai & Turner) consomment majoritairement `useApp`, mais certaines opérations rendez-vous utilisent Supabase directement (`appointment_details`).

## 2) Flux de création de ticket
- Origines principales : `NewTicketPage` et `LaiTurnerClientPortalPage` appellent `useApp().addTicket` en fournissant les données et l'historique initial.
- Dans `App.tsx`, `addTicket` normalise le chat, prépare les colonnes dynamiques (notes internes, rendez-vous, colonne metadata), ajoute `company_id/name`, puis insère dans `supabase.from("tickets")`; en mode `messages_table`, les messages sont ensuite stockés via `ticket_messages` (persistés par `persistTicketMessages`).

## 3) Flux de suppression de ticket
- `ManagerDashboardPage` : handler `handleDeleteTicket` déclenche `deleteTicket(ticketId)` après confirmation.
- `LaiTurnerManagerDashboardPage` : handler `handleDeleteTicket` appelle aussi `deleteTicket(ticket.id)`.
- Dans `App.tsx`, `deleteTicket` applique un `delete` sur `tickets` avec filtre `id` et ajoute `company_id` si disponible, puis purge l'état local.

## 4) Flux de mise à jour (statut, assignation, messages, rendez-vous)
- `updateTicketStatus` met à jour `status`/`updated_at` sur `tickets` puis synchronise l'état.
- `addChatMessage`/`sendAgentMessage` mettent à jour `status`, `chat_history` (ou `ticket_messages`) et déclenchent éventuellement une réponse IA.
- `assignTicket` peut créer un résumé IA et mettre à jour `assigned_agent_id` (et le chat selon le mode de stockage).
- `proposeOrUpdateAppointment`/`deleteAppointment` utilisent Supabase pour gérer `current_appointment` ou la table `appointment_details`; les pages Lai & Turner manipulent directement `appointment_details` (création/lecture) en dehors du contexte.

## 5) Intégration avec Supabase (tickets, ticket_messages, RPC)
- `App.tsx` charge et met à jour `tickets` via Supabase, choisit le mode de stockage de chat, et persiste les messages selon le mode.
- `deleteTicket`, `updateTicketStatus`, `assignTicket`, `addChatMessage` utilisent `supabase.from("tickets")` ; `persistTicketMessages` gère `ticket_messages` en mode dédié.
- Les rendez-vous ont une double voie : `current_appointment` (contexte) et `appointment_details` (pages Lai & Turner via Supabase direct).

## 6) Problèmes / risques détectés
- Écritures directes Supabase hors contexte pour les rendez-vous (`appointment_details`) pouvant désynchroniser l'état et contourner la logique de stockage des messages.
- Filtrage `company_id` appliqué dans `deleteTicket` seulement si présent, ce qui peut laisser des suppressions échouer silencieusement si `company_id` est indéfini.
- Dualité de stockage des messages (embedded vs `ticket_messages`) exige que toutes les pages passent par le contexte ; les interactions directes risquent de ne pas respecter le mode choisi.

## 7) Propositions d’actions correctives (sans implémentation)
- Forcer toutes les opérations tickets/rendez-vous à passer par `useApp` et harmoniser la gestion des rendez-vous (`current_appointment` vs `appointment_details`).
- Rendre obligatoire le filtre `company_id` (ou log explicite) dans les opérations sensibles comme la suppression pour éviter les réapparitions après refresh.
- Ajouter des logs/alertes autour des inserts/suppressions pour tracer les échecs (quota/RLS) et rafraîchir le quota après création/suppression.

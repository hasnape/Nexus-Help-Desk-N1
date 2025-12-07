-- Healthcheck Nexus Support Hub : volumétrie, cohérence company_id, quotas et orphelins.
-- Exécution recommandée depuis le SQL editor Supabase ou psql (en lecture seule).

-- A. Vue d'ensemble des entreprises / tickets / plans
WITH month_bounds AS (
  SELECT date_trunc('month', now()) AS month_start
)
SELECT
  c.id AS company_id,
  c.name AS company_name,
  cs.plan_tier,
  cs.plan_max_tickets_month,
  cs.unlimited,
  COUNT(t.id) AS tickets_total,
  COUNT(t.id) FILTER (WHERE t.created_at >= mb.month_start) AS tickets_this_month,
  COUNT(u.id) FILTER (WHERE u.role = 'manager') AS managers_count,
  COUNT(u.id) FILTER (WHERE u.role = 'agent') AS agents_count,
  COUNT(u.id) FILTER (WHERE u.role = 'user') AS end_users_count
FROM companies c
LEFT JOIN company_settings cs ON cs.company_id = c.id
LEFT JOIN tickets t ON t.company_id = c.id
LEFT JOIN users u ON u.company_id = c.id
CROSS JOIN month_bounds mb
GROUP BY c.id, c.name, cs.plan_tier, cs.plan_max_tickets_month, cs.unlimited
ORDER BY c.name;

-- B. Cohérence tickets / company_id / company_name
-- 1) Comptage des tickets par entreprise
SELECT
  t.company_id,
  COUNT(*) AS tickets_count
FROM tickets t
GROUP BY t.company_id
ORDER BY t.company_id;

-- 2) Tickets sans company_id (à relier ou corriger)
SELECT id, title, created_at
FROM tickets
WHERE company_id IS NULL
ORDER BY created_at DESC;

-- 3) Tickets où le company_name enregistré diffère du nom officiel
SELECT t.id, t.company_id, t.company_name AS ticket_company_name, c.name AS companies_name
FROM tickets t
JOIN companies c ON c.id = t.company_id
WHERE t.company_name IS NOT NULL
  AND t.company_name <> c.name
ORDER BY t.company_id, t.id;

-- C. Quota du mois courant (comparaison avec RPC get_my_company_month_quota)
WITH month_bounds AS (
  SELECT date_trunc('month', now()) AS month_start
)
SELECT
  c.id AS company_id,
  c.name AS company_name,
  cs.plan_tier,
  cs.plan_max_tickets_month,
  cs.unlimited,
  COUNT(t.id) FILTER (WHERE t.created_at >= mb.month_start) AS tickets_this_month
FROM companies c
LEFT JOIN company_settings cs ON cs.company_id = c.id
LEFT JOIN tickets t ON t.company_id = c.id
CROSS JOIN month_bounds mb
GROUP BY c.id, c.name, cs.plan_tier, cs.plan_max_tickets_month, cs.unlimited
ORDER BY c.name;

-- D. Détection d'orphelins (références tickets manquantes)
-- chat_messages sans ticket parent
SELECT cm.id, cm.ticket_id
FROM chat_messages cm
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = cm.ticket_id)
ORDER BY cm.id;

-- appointment_details sans ticket parent
SELECT ad.id, ad.ticket_id
FROM appointment_details ad
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = ad.ticket_id)
ORDER BY ad.id;

-- internal_notes sans ticket parent
SELECT n.id, n.ticket_id
FROM internal_notes n
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = n.ticket_id)
ORDER BY n.id;

-- ticket_intake_data sans ticket parent
SELECT i.id, i.ticket_id
FROM ticket_intake_data i
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = i.ticket_id)
ORDER BY i.id;

-- E. Tickets par statut (vision globale par entreprise)
SELECT
  c.id AS company_id,
  c.name AS company_name,
  t.status,
  COUNT(*) AS tickets_count
FROM tickets t
LEFT JOIN companies c ON c.id = t.company_id
GROUP BY c.id, c.name, t.status
ORDER BY c.name, t.status;

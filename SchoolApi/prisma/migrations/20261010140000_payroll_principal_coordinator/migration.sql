-- Owner decision 2026-10-09: principal and coordinator manage payroll for their own
-- branch (salary, overtime, adjustments, runs, approval, payment). Pay rules stay
-- with principal/admin (API check). Existing system roles get the new keys.
INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", k.key, now()
FROM "roles" r
CROSS JOIN (
  VALUES ('payroll.view'), ('payroll.add'), ('payroll.edit'),
         ('payroll.submit'), ('payroll.approve'), ('payroll.export')
) AS k(key)
WHERE r."is_system" = true
  AND r."key" IN ('PRINCIPAL', 'COORDINATOR')
  AND EXISTS (SELECT 1 FROM "permissions" p WHERE p."key" = k.key)
ON CONFLICT DO NOTHING;

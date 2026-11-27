-- Homework and question bank grants for system roles on databases that were seeded after
-- 20261012150000_homework (that migration only granted homework to roles that already existed, and
-- question bank permissions were never granted to anyone but SUPER_ADMIN). Mirrors
-- src/core/rbac/default-role-permissions.ts. Idempotent; only adds, never removes.

INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", g.key, now()
FROM "roles" r
JOIN (
  VALUES
    ('PRINCIPAL', 'homework.view'), ('PRINCIPAL', 'homework.add'), ('PRINCIPAL', 'homework.edit'),
    ('PRINCIPAL', 'homework.delete'), ('PRINCIPAL', 'homework.submit'),
    ('PRINCIPAL', 'questions.view'), ('PRINCIPAL', 'questions.add'), ('PRINCIPAL', 'questions.edit'),
    ('PRINCIPAL', 'questions.delete'),
    ('HEAD_TEACHER', 'homework.view'), ('HEAD_TEACHER', 'homework.add'), ('HEAD_TEACHER', 'homework.edit'),
    ('COORDINATOR', 'homework.view'), ('COORDINATOR', 'homework.add'), ('COORDINATOR', 'homework.edit'),
    ('COORDINATOR', 'questions.view'), ('COORDINATOR', 'questions.add'), ('COORDINATOR', 'questions.edit'),
    ('TEACHER', 'homework.view'), ('TEACHER', 'homework.add'), ('TEACHER', 'homework.edit'),
    ('TEACHER', 'questions.view'), ('TEACHER', 'questions.add'), ('TEACHER', 'questions.edit'),
    ('PARENT', 'homework.view'), ('PARENT', 'homework.submit')
) AS g(role_key, key) ON g.role_key = r."key"
WHERE r."is_system" = true
  AND EXISTS (SELECT 1 FROM "permissions" p WHERE p."key" = g.key)
ON CONFLICT DO NOTHING;

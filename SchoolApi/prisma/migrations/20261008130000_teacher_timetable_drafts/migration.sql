-- User decision 2026-10-08: class teachers build the draft timetable of their own sections
-- (the API limits it to class-teacher sections; publishing stays with principals).
INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", k.key, now()
FROM "roles" r
CROSS JOIN (VALUES ('timetable.add'), ('timetable.edit')) AS k(key)
WHERE r."school_id" IS NULL
  AND r."key" = 'TEACHER'
  AND EXISTS (SELECT 1 FROM "permissions" p WHERE p."key" = k.key)
ON CONFLICT DO NOTHING;

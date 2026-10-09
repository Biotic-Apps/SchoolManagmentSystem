-- Retired 2026-10-10 by owner decision: Live classes and Syllabus & Books.
-- Live classes are removed completely (tables, enum, permissions, notifications).
-- Syllabus & Books: only the permissions go; syllabus/book-list tables and data stay.

-- Live classes
DELETE FROM "notifications" WHERE "category" = 'LIVE_CLASS';
DROP TABLE IF EXISTS "live_class_attendance";
DROP TABLE IF EXISTS "live_class_sections";
DROP TABLE IF EXISTS "live_classes";
DROP TYPE IF EXISTS "live_class_status";

-- Permissions of both features (role links first: role_permissions restricts deletes).
DELETE FROM "role_permissions"
WHERE "permission_key" LIKE 'live\_classes.%' OR "permission_key" LIKE 'syllabus.%';
DELETE FROM "permissions"
WHERE "key" LIKE 'live\_classes.%' OR "key" LIKE 'syllabus.%';

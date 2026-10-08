-- academics-timetable-contract §4: day-specific bell schedules, section groups, class curriculum.
-- Idempotent; touches only labels of teaching periods, class_subjects links and role permissions.

-- 1. Bell schedule rows per weekday (0 = default for every working day).
ALTER TABLE "branch_periods" ADD COLUMN IF NOT EXISTS "day" SMALLINT NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS "branch_periods_branch_id_period_index_key";
CREATE UNIQUE INDEX IF NOT EXISTS "branch_periods_branch_id_day_period_index_key"
  ON "branch_periods"("branch_id", "day", "period_index");

-- 2. Teaching periods are numbered ("Period N"), never named after subjects.
DO $$
DECLARE cleared integer;
BEGIN
  UPDATE "branch_periods" SET "label" = NULL WHERE "is_break" = false AND "label" IS NOT NULL;
  GET DIAGNOSTICS cleared = ROW_COUNT;
  RAISE NOTICE 'academics_timetable: cleared % teaching-period labels', cleared;
END $$;

-- 3. Groups and curriculum order.
ALTER TABLE "sections" ADD COLUMN IF NOT EXISTS "group" VARCHAR(30);
ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "group" VARCHAR(30);
ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;

-- 4. Classes with no active subject get every active subject of their school; curated classes untouched.
DO $$
DECLARE linked integer;
BEGIN
  INSERT INTO "class_subjects" ("id", "school_id", "class_id", "subject_id", "status", "created_at", "updated_at")
  SELECT gen_random_uuid(), c."school_id", c."id", s."id", 'ACTIVE', now(), now()
  FROM "classes" c
  JOIN "subjects" s ON s."school_id" = c."school_id" AND s."status" = 'ACTIVE'
  WHERE c."status" = 'ACTIVE'
    AND NOT EXISTS (
      SELECT 1 FROM "class_subjects" cs WHERE cs."class_id" = c."id" AND cs."status" = 'ACTIVE'
    )
  ON CONFLICT ("class_id", "subject_id") DO NOTHING;
  GET DIAGNOSTICS linked = ROW_COUNT;
  RAISE NOTICE 'academics_timetable: linked % class subjects', linked;
END $$;

-- Alphabetical order inside each class (only classes whose order was never set).
UPDATE "class_subjects" cs
SET "sort_order" = ordered.position
FROM (
  SELECT x."id", (row_number() OVER (PARTITION BY x."class_id" ORDER BY lower(s."name"), s."code") - 1)::int AS position
  FROM "class_subjects" x
  JOIN "subjects" s ON s."id" = x."subject_id"
  WHERE NOT EXISTS (
    SELECT 1 FROM "class_subjects" y WHERE y."class_id" = x."class_id" AND y."sort_order" <> 0
  )
) ordered
WHERE cs."id" = ordered."id";

-- 5. Coordinators and head teachers build timetables (publishing stays with principals).
INSERT INTO "role_permissions" ("role_id", "permission_key", "created_at")
SELECT r."id", k.key, now()
FROM "roles" r
CROSS JOIN (VALUES ('timetable.add'), ('timetable.edit')) AS k(key)
WHERE r."school_id" IS NULL
  AND r."key" IN ('COORDINATOR', 'HEAD_TEACHER')
  AND EXISTS (SELECT 1 FROM "permissions" p WHERE p."key" = k.key)
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  ALTER TABLE "branch_periods" ADD CONSTRAINT "branch_periods_day_check" CHECK ("day" BETWEEN 0 AND 7);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

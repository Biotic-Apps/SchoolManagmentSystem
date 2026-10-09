-- Give every ACTIVE session without a grading scheme the default APPROVED
-- "Standard <session>" scheme (pass 40%, A+..F bands), as school setup now does.
-- Idempotent: sessions that already have any scheme are skipped.
WITH new_schemes AS (
  INSERT INTO "grading_schemes" (
    "id", "school_id", "session_id", "name", "pass_percent", "status",
    "approved_by_id", "approved_at", "created_by_id", "created_at", "updated_at"
  )
  SELECT gen_random_uuid(), s."school_id", s."id", 'Standard ' || s."name", 40,
         'APPROVED', a.actor_id, now(), a.actor_id, now(), now()
  FROM "academic_sessions" s
  JOIN "branches" br ON br."id" = s."branch_id"
  CROSS JOIN LATERAL (
    SELECT COALESCE(
      s."created_by_id",
      br."principal_user_id",
      (SELECT u."id" FROM "users" u ORDER BY u."created_at" LIMIT 1)
    ) AS actor_id
  ) a
  WHERE s."status" = 'ACTIVE'
    AND a.actor_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "grading_schemes" g WHERE g."session_id" = s."id"
    )
  ON CONFLICT ("session_id", "name") DO NOTHING
  RETURNING "id"
)
INSERT INTO "grade_bands" (
  "id", "scheme_id", "grade", "min_percent", "max_percent", "remark", "grade_point"
)
SELECT gen_random_uuid(), n."id", b.grade, b.min_percent, b.max_percent, b.remark, b.grade_point
FROM new_schemes n
CROSS JOIN (VALUES
  ('A+', 90, 100, 'Outstanding', 4.00),
  ('A', 80, 89, 'Excellent', 3.50),
  ('B', 70, 79, 'Very good', 3.00),
  ('C', 60, 69, 'Good', 2.50),
  ('D', 50, 59, 'Fair', 2.00),
  ('E', 40, 49, 'Satisfactory', 1.50),
  ('F', 0, 39, 'Needs improvement', 0.00)
) AS b(grade, min_percent, max_percent, remark, grade_point);

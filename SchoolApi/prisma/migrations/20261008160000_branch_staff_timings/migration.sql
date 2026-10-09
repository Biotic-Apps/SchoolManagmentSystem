-- Teachers' own day: staffArrivesAt (default 30 min before opensAt, not before 00:00)
-- and staffLeavesAt (default closesAt) inside branches.timings (jsonb, HH:mm strings).
UPDATE "branches"
SET "timings" = "timings"
  || jsonb_build_object(
       'staffArrivesAt',
       COALESCE(
         "timings"->>'staffArrivesAt',
         CASE
           WHEN ("timings"->>'opensAt')::time < TIME '00:30' THEN '00:00'
           ELSE to_char(("timings"->>'opensAt')::time - INTERVAL '30 minutes', 'HH24:MI')
         END
       ),
       'staffLeavesAt',
       COALESCE("timings"->>'staffLeavesAt', "timings"->>'closesAt')
     )
WHERE "timings" IS NOT NULL
  AND jsonb_typeof("timings") = 'object'
  AND "timings" ? 'opensAt'
  AND "timings" ? 'closesAt'
  AND ("timings"->>'opensAt') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$';

-- audit_logs is append-only (security.md §9, databaseManagement.md §3).
CREATE OR REPLACE FUNCTION forbid_append_only_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only: % is not allowed', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_append_only_row
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION forbid_append_only_mutation();

CREATE TRIGGER audit_logs_append_only_truncate
  BEFORE TRUNCATE ON "audit_logs"
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_append_only_mutation();

-- System role keys are globally unique; custom keys never collide with them.
ALTER TABLE "roles" ADD CONSTRAINT "roles_system_role_is_global"
  CHECK (NOT "is_system" OR "school_id" IS NULL);

-- Date ranges.
ALTER TABLE "academic_sessions" ADD CONSTRAINT "academic_sessions_dates_check"
  CHECK ("end_date" >= "start_date");
ALTER TABLE "terms" ADD CONSTRAINT "terms_dates_check"
  CHECK ("end_date" >= "start_date");
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_dates_check"
  CHECK ("end_date" >= "start_date");
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_validity_check"
  CHECK ("valid_until" IS NULL OR "valid_until" >= "valid_from");

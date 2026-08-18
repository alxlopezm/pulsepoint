-- Restricted, non-owner application role. Table owners (and superusers) bypass
-- Row Level Security in Postgres by default, so all runtime traffic from the
-- Express app must connect as this role, not as the migration/owner role.
-- Change this password for any non-local deployment.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pulsepoint_app') THEN
    CREATE ROLE pulsepoint_app LOGIN PASSWORD 'pulsepoint_app';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO pulsepoint_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pulsepoint_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pulsepoint_app;

-- Enable Row Level Security
ALTER TABLE "business_units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "initiatives" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "updates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "next_steps" ENABLE ROW LEVEL SECURITY;

-- business_units: public read-only reference data, no owner concept
CREATE POLICY "business_units_select" ON "business_units"
  FOR SELECT
  USING (true);

-- initiatives: owned by created_by, scoped via the app.current_user_id
-- session variable that the Express app sets per-request (replaces
-- Supabase's auth.uid()).
CREATE POLICY "initiatives_select" ON "initiatives"
  FOR SELECT
  USING (created_by = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "initiatives_insert" ON "initiatives"
  FOR INSERT
  WITH CHECK (created_by = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "initiatives_update" ON "initiatives"
  FOR UPDATE
  USING (created_by = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (created_by = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "initiatives_delete" ON "initiatives"
  FOR DELETE
  USING (created_by = current_setting('app.current_user_id', true)::uuid);

-- updates: ownership derived via the parent initiative
CREATE POLICY "updates_select" ON "updates"
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = updates.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "updates_insert" ON "updates"
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = updates.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "updates_update" ON "updates"
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = updates.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = updates.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "updates_delete" ON "updates"
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = updates.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

-- next_steps: ownership derived via the parent initiative
CREATE POLICY "next_steps_select" ON "next_steps"
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = next_steps.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "next_steps_insert" ON "next_steps"
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = next_steps.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "next_steps_update" ON "next_steps"
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = next_steps.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = next_steps.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY "next_steps_delete" ON "next_steps"
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "initiatives" i
    WHERE i.id = next_steps.initiative_id
      AND i.created_by = current_setting('app.current_user_id', true)::uuid
  ));

-- business_units is static reference data and doesn't need realtime.
-- RLS still applies to postgres_changes payloads, so per-user isolation
-- established above is preserved for realtime subscriptions too.
alter publication supabase_realtime add table public.initiatives;
alter publication supabase_realtime add table public.updates;
alter publication supabase_realtime add table public.next_steps;

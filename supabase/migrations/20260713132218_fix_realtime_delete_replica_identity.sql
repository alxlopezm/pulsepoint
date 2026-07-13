-- By default Postgres's REPLICA IDENTITY only includes primary key columns in
-- the "old row" image sent to logical replication subscribers (which Realtime
-- uses). Our updates/next_steps realtime subscriptions filter DELETE events by
-- initiative_id, a non-primary-key column, so that filter can never match on
-- delete and the event is silently dropped, causing UI lists to not refresh
-- after a row is deleted. REPLICA IDENTITY FULL includes all columns in the
-- old row image, fixing filtered delete events.
alter table public.updates replica identity full;
alter table public.next_steps replica identity full;

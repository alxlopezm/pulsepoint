create table public.business_units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.business_units enable row level security;

-- Shared reference data: readable by any authenticated user. No insert/update/delete
-- policy is defined, so those actions default-deny for all client roles.
create policy "authenticated users can read business units"
  on public.business_units
  for select
  to authenticated
  using (true);

insert into public.business_units (name) values
  ('Finance'),
  ('R&D'),
  ('Manufacturing'),
  ('GI'),
  ('Infrastructure'),
  ('Customer Experience'),
  ('Security')
on conflict (name) do nothing;

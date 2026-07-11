create table public.updates (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references public.initiatives(id) on delete cascade,
  date date not null default current_date,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.updates enable row level security;

create policy "users can select updates on own initiatives"
  on public.updates for select to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = updates.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can insert updates on own initiatives"
  on public.updates for insert to authenticated
  with check (exists (
    select 1 from public.initiatives i
    where i.id = updates.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can update updates on own initiatives"
  on public.updates for update to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = updates.initiative_id and i.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.initiatives i
    where i.id = updates.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can delete updates on own initiatives"
  on public.updates for delete to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = updates.initiative_id and i.user_id = auth.uid()
  ));

create index idx_updates_initiative_id on public.updates(initiative_id);
create index idx_updates_date on public.updates(date desc);

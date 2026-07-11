create table public.next_steps (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references public.initiatives(id) on delete cascade,
  description text not null,
  responsible text,
  due_date date,
  start_date date,
  completion_date date,
  created_at timestamptz not null default now()
);

alter table public.next_steps enable row level security;

create policy "users can select next_steps on own initiatives"
  on public.next_steps for select to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = next_steps.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can insert next_steps on own initiatives"
  on public.next_steps for insert to authenticated
  with check (exists (
    select 1 from public.initiatives i
    where i.id = next_steps.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can update next_steps on own initiatives"
  on public.next_steps for update to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = next_steps.initiative_id and i.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.initiatives i
    where i.id = next_steps.initiative_id and i.user_id = auth.uid()
  ));

create policy "users can delete next_steps on own initiatives"
  on public.next_steps for delete to authenticated
  using (exists (
    select 1 from public.initiatives i
    where i.id = next_steps.initiative_id and i.user_id = auth.uid()
  ));

create index idx_next_steps_initiative_id on public.next_steps(initiative_id);
create index idx_next_steps_due_date on public.next_steps(due_date);

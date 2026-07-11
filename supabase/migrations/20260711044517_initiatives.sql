create table public.initiatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner text,
  business_unit_id uuid not null references public.business_units(id) on delete restrict,
  priority text not null default 'Medium'
    check (priority in ('High','Medium','Low')),
  status text not null default 'Requested'
    check (status in ('Requested','In Design','In Assessment','Approved','In Development')),
  type text not null
    check (type in ('Technology Request','Enterprise Architecture Governance','Enterprise Architecture Growth')),
  start_date date,
  end_date date,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.initiatives enable row level security;

create policy "users can select own initiatives"
  on public.initiatives for select to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own initiatives"
  on public.initiatives for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own initiatives"
  on public.initiatives for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own initiatives"
  on public.initiatives for delete to authenticated
  using (auth.uid() = user_id);

create index idx_initiatives_user_id on public.initiatives(user_id);
create index idx_initiatives_business_unit_id on public.initiatives(business_unit_id);
create index idx_initiatives_status on public.initiatives(status);

create trigger trg_initiatives_updated_at
  before update on public.initiatives
  for each row execute function public.set_updated_at();

-- pgcrypto is enabled by default on Supabase, asserted defensively for gen_random_uuid()
create extension if not exists pgcrypto;

-- Shared trigger function for updated_at columns
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Personal state store for TokenLens: one JSON document per deployment
-- (single-user tool), addressed by a fixed id. Accessed exclusively with
-- the service role key from server code; RLS is enabled with no policies
-- so anon and authenticated roles have no path to this table.

create table if not exists public.personal_state (
  id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.personal_state enable row level security;

-- Keep updated_at fresh on upsert for observability (the authoritative
-- last-write-wins timestamp lives inside doc.updatedAt).
create or replace function public.personal_state_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists personal_state_touch on public.personal_state;
create trigger personal_state_touch
  before update on public.personal_state
  for each row
  execute function public.personal_state_touch();

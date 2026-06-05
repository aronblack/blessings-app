create extension if not exists "pgcrypto";

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  mobile text,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Use this policy only if you want anonymous public inserts from the form.
-- If you use the service role key on the server, this policy is not required.
create policy "Allow public inserts into subscribers"
  on public.subscribers
  for insert
  to anon
  with check (true);

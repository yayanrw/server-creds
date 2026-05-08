-- Run this in your Supabase SQL editor

create table if not exists servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  public_ip text,
  local_ip text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  server_id uuid references servers(id) on delete set null,
  type text not null check (type in ('ssh', 'database', 'api_key', 'env')),
  name text not null,
  username text,
  encrypted_value text not null,
  iv text not null,
  auth_tag text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table servers enable row level security;
alter table credentials enable row level security;

create policy "owner only" on servers
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "owner only" on credentials
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

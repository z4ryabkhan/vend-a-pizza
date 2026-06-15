-- FounderCouncil AI — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) to provision storage.

create extension if not exists "pgcrypto";

create table if not exists public.council_sessions (
  id                uuid primary key default gen_random_uuid(),
  question          text not null,
  council_type      text not null,
  -- Array of { seat, role, model, content, error? }
  model_responses   jsonb not null default '[]'::jsonb,
  -- Structured Chairman verdict object
  chairman_response jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists council_sessions_created_at_idx
  on public.council_sessions (created_at desc);

-- Row Level Security.
-- The app writes from the server using the service-role key, which bypasses
-- RLS. Browser reads use the anon key, so we expose read-only access here.
-- Tighten this (e.g. add a user_id column + auth.uid() policy) before adding
-- multi-tenant auth.
alter table public.council_sessions enable row level security;

drop policy if exists "Public read access" on public.council_sessions;
create policy "Public read access"
  on public.council_sessions
  for select
  using (true);

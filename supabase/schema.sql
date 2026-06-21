-- FounderCouncil AI — Supabase schema (auth-aware)
-- Run this in the Supabase SQL editor (or via the CLI) to provision storage.

create extension if not exists "pgcrypto";

create table if not exists public.council_sessions (
  id                uuid primary key default gen_random_uuid(),
  -- Owner. Nullable so anonymous/demo rows remain valid, but the app always
  -- sets this when a user is signed in.
  user_id           uuid references auth.users (id) on delete cascade,
  question          text not null,
  council_type      text not null,
  -- Array of { seat, role, model, content, error? }
  model_responses   jsonb not null default '[]'::jsonb,
  -- Structured Chairman verdict object
  chairman_response jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

-- Add user_id if upgrading an existing install that predates auth.
alter table public.council_sessions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists council_sessions_created_at_idx
  on public.council_sessions (created_at desc);
create index if not exists council_sessions_user_id_idx
  on public.council_sessions (user_id);

-- Row Level Security: each user only sees and manages their own sessions.
-- Inserts are performed server-side with the service-role key (which bypasses
-- RLS) and always stamp the authenticated user_id. Reads/deletes from the
-- browser use the user's session, so these policies scope them per user.
alter table public.council_sessions enable row level security;

drop policy if exists "Public read access" on public.council_sessions; -- legacy

drop policy if exists "Owner can read" on public.council_sessions;
create policy "Owner can read"
  on public.council_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Owner can insert" on public.council_sessions;
create policy "Owner can insert"
  on public.council_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owner can delete" on public.council_sessions;
create policy "Owner can delete"
  on public.council_sessions
  for delete
  using (auth.uid() = user_id);

-- ---- Subscriptions ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  councils_used_this_month integer DEFAULT 0,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_council_usage(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO subscriptions (user_id, councils_used_this_month)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET councils_used_this_month = subscriptions.councils_used_this_month + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User plans table for trial + plan without Stripe
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basic','super_host','business')) default 'basic',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

-- RLS: a user can view and manage only their own plan row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_plans' AND policyname='Users can view own plan'
  ) THEN
    CREATE POLICY "Users can view own plan"
      ON public.user_plans FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_plans' AND policyname='Users can insert own plan'
  ) THEN
    CREATE POLICY "Users can insert own plan"
      ON public.user_plans FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_plans' AND policyname='Users can update own plan'
  ) THEN
    CREATE POLICY "Users can update own plan"
      ON public.user_plans FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Helper function to start or extend a trial for a user (idempotent-ish)
create or replace function public.ensure_trial_for_user(target_user_id uuid, trial_days int default 14)
returns public.user_plans
language plpgsql
security definer
as $$
DECLARE
  existing public.user_plans;
  now_ts timestamptz := now();
BEGIN
  select * into existing from public.user_plans where user_id = target_user_id;
  IF found THEN
    IF existing.trial_ends_at IS NULL OR existing.trial_ends_at < now_ts THEN
      existing.trial_started_at := now_ts;
      existing.trial_ends_at := now_ts + make_interval(days => trial_days);
      update public.user_plans set trial_started_at = existing.trial_started_at, trial_ends_at = existing.trial_ends_at where user_id = target_user_id;
    END IF;
    RETURN existing;
  ELSE
    insert into public.user_plans(user_id, plan, trial_started_at, trial_ends_at)
      values (target_user_id, 'basic', now_ts, now_ts + make_interval(days => trial_days))
      returning * into existing;
    RETURN existing;
  END IF;
END;
$$;

-- Manual upgrade requests storage (for no-Stripe flow)
create table if not exists public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  desired_plan text not null check (desired_plan in ('super_host','business','custom')),
  message text,
  properties_requested int,
  contact_email text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.upgrade_requests enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='upgrade_requests' AND policyname='Users can view their upgrade requests'
  ) THEN
    CREATE POLICY "Users can view their upgrade requests"
      ON public.upgrade_requests FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='upgrade_requests' AND policyname='Users can insert their upgrade requests'
  ) THEN
    CREATE POLICY "Users can insert their upgrade requests"
      ON public.upgrade_requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;
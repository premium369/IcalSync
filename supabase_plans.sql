-- User plans table for trial + plan without Stripe
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basic','super_host','custom')) default 'basic',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

-- Ensure plan check constraint matches allowed values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='user_plans' AND constraint_name='user_plans_plan_check'
  ) THEN
    ALTER TABLE public.user_plans DROP CONSTRAINT user_plans_plan_check;
  END IF;
  ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_plan_check CHECK (plan in ('basic','super_host','custom'));
  UPDATE public.user_plans SET plan='custom' WHERE plan='business';
  UPDATE public.user_plans SET trial_started_at=NULL, trial_ends_at=NULL WHERE trial_started_at IS NOT NULL OR trial_ends_at IS NOT NULL;
END$$;

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

-- retired trial helper intentionally removed

-- Manual upgrade requests storage (for no-Stripe flow)
create table if not exists public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  desired_plan text not null check (desired_plan in ('super_host','custom')),
  message text,
  properties_requested int,
  contact_email text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.upgrade_requests enable row level security;

-- Ensure desired_plan constraint matches allowed values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='upgrade_requests' AND constraint_name='upgrade_requests_desired_plan_check'
  ) THEN
    ALTER TABLE public.upgrade_requests DROP CONSTRAINT upgrade_requests_desired_plan_check;
  END IF;
  ALTER TABLE public.upgrade_requests ADD CONSTRAINT upgrade_requests_desired_plan_check CHECK (desired_plan in ('super_host','custom'));
END$$;

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
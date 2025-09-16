-- Create events table scoped by user
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start timestamptz not null,
  "end" timestamptz,
  all_day boolean,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.events enable row level security;

-- Only owner can select/insert/update/delete their events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can view their events'
  ) THEN
    CREATE POLICY "Users can view their events"
      ON public.events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can insert their events'
  ) THEN
    CREATE POLICY "Users can insert their events"
      ON public.events FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can update their events'
  ) THEN
    CREATE POLICY "Users can update their events"
      ON public.events FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname='Users can delete their events'
  ) THEN
    CREATE POLICY "Users can delete their events"
      ON public.events FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Properties schema
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  ical_token uuid not null default gen_random_uuid()
);

-- If properties already existed without ical_token, add and backfill it
alter table public.properties add column if not exists ical_token uuid;
update public.properties set ical_token = gen_random_uuid() where ical_token is null;
alter table public.properties alter column ical_token set not null;
alter table public.properties alter column ical_token set default gen_random_uuid();

create table if not exists public.property_icals (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_property_icals_property_id on public.property_icals(property_id);
create unique index if not exists uq_property_icals_property_url on public.property_icals(property_id, url);
create unique index if not exists uq_properties_ical_token on public.properties(ical_token);

-- Enable RLS
alter table public.properties enable row level security;
alter table public.property_icals enable row level security;
alter table public.events add column if not exists property_id uuid references public.properties(id) on delete set null;
create index if not exists idx_events_property_id on public.events(property_id);

-- Properties policies (owner-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Users can view their properties'
  ) THEN
    CREATE POLICY "Users can view their properties"
      ON public.properties FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Users can insert their properties'
  ) THEN
    CREATE POLICY "Users can insert their properties"
      ON public.properties FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Users can update their properties'
  ) THEN
    CREATE POLICY "Users can update their properties"
      ON public.properties FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Users can delete their properties'
  ) THEN
    CREATE POLICY "Users can delete their properties"
      ON public.properties FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Property iCals policies (owner-only via parent property)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_icals' AND policyname='Users can view their property iCals'
  ) THEN
    CREATE POLICY "Users can view their property iCals"
      ON public.property_icals FOR SELECT
      USING (exists (
        select 1 from public.properties p
        where p.id = property_id and p.user_id = auth.uid()
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_icals' AND policyname='Users can insert their property iCals'
  ) THEN
    CREATE POLICY "Users can insert their property iCals"
      ON public.property_icals FOR INSERT
      WITH CHECK (exists (
        select 1 from public.properties p
        where p.id = property_id and p.user_id = auth.uid()
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_icals' AND policyname='Users can update their property iCals'
  ) THEN
    CREATE POLICY "Users can update their property iCals"
      ON public.property_icals FOR UPDATE
      USING (exists (
        select 1 from public.properties p
        where p.id = property_id and p.user_id = auth.uid()
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_icals' AND policyname='Users can delete their property iCals'
  ) THEN
    CREATE POLICY "Users can delete their property iCals"
      ON public.property_icals FOR DELETE
      USING (exists (
        select 1 from public.properties p
        where p.id = property_id and p.user_id = auth.uid()
      ));
  END IF;
END$$;
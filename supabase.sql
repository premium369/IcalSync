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

-- External events cache (parsed from OTA iCal feeds)
create table if not exists public.external_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  uid text not null, -- iCal UID from feed
  title text not null,
  start timestamptz not null,
  "end" timestamptz,
  all_day boolean,
  source text not null default 'ics',
  feed_url text,
  ota text, -- airbnb, booking, vrbo, etc
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_external_events_property_uid on public.external_events(property_id, uid);
create index if not exists idx_external_events_user on public.external_events(user_id);
create index if not exists idx_external_events_property on public.external_events(property_id);

alter table public.external_events enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='external_events' AND policyname='Users can view their external events'
  ) THEN
    CREATE POLICY "Users can view their external events"
      ON public.external_events FOR SELECT
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

-- Property notes schema
create table if not exists public.property_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  note_date date not null,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_property_notes_user_id on public.property_notes(user_id);
create index if not exists idx_property_notes_property_id on public.property_notes(property_id);
create unique index if not exists uq_property_notes_unique_per_day on public.property_notes(user_id, property_id, note_date);

-- Enable RLS
alter table public.properties enable row level security;
alter table public.property_icals enable row level security;
alter table public.events add column if not exists property_id uuid references public.properties(id) on delete set null;
create index if not exists idx_events_property_id on public.events(property_id);
alter table public.property_notes enable row level security;

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

-- Property notes policies (owner-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_notes' AND policyname='Users can view their notes'
  ) THEN
    CREATE POLICY "Users can view their notes"
      ON public.property_notes FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_notes' AND policyname='Users can insert their notes'
  ) THEN
    CREATE POLICY "Users can insert their notes"
      ON public.property_notes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_notes' AND policyname='Users can update their notes'
  ) THEN
    CREATE POLICY "Users can update their notes"
      ON public.property_notes FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='property_notes' AND policyname='Users can delete their notes'
  ) THEN
    CREATE POLICY "Users can delete their notes"
      ON public.property_notes FOR DELETE
      USING (auth.uid() = user_id);
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
-- Blog posts schema
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content text not null,
  excerpt text,
  featured_image_path text,
  status text not null default 'draft', -- 'draft' | 'published'
  views integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for blog posts
alter table public.blog_posts enable row level security;

-- Public can view published posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='blog_posts' AND policyname='Public can view published blog posts'
  ) THEN
    CREATE POLICY "Public can view published blog posts"
      ON public.blog_posts FOR SELECT
      USING (status = 'published');
  END IF;
END$$;

-- Maintain updated_at on update
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'blog_posts_touch_updated_at'
  ) THEN
    CREATE TRIGGER blog_posts_touch_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END$$;

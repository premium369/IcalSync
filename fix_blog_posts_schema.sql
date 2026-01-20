-- Fix for "Could not find the 'content' column of 'blog_posts' in the schema cache"
-- This script adds the missing 'content' column if it doesn't exist and reloads the schema cache.

-- Ensure the content column exists (with NOT NULL constraint matching the original schema)
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

-- Ensure other columns exist (idempotent)
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_path TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Ensure unique constraint on slug
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_slug_key') THEN
    ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
END$$;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Fix for "null value in column "content_md" of relation "blog_posts" violates not-null constraint"
-- This script adds the missing 'content_md' column if it doesn't exist and ensures it's nullable or has a default.

-- Ensure the content_md column exists
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_md TEXT DEFAULT '';

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

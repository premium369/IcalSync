-- Fix for "null value in column "author_email" of relation "blog_posts" violates not-null constraint"
-- This script adds the missing 'author_email' column if it doesn't exist.

-- Ensure the author_email column exists
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_email TEXT;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

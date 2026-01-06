
-- Ensure users table exists
-- This table mirrors auth.users for admin purposes
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_id TEXT 
);

-- Payments Table (For manual admin entry)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'USD',
  mode TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT NOT NULL,
  admin_id UUID REFERENCES public.users(id),
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Notes Table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table (Optional, if moving to DB-based subs later)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id TEXT, -- Logical plan ID (basic, super_host, etc)
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_admin_sync() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, status)
  VALUES (new.id, new.email, 'user', 'pending'); -- Default to pending for approval flow
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created_admin_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_admin_sync();

-- Backfill existing users from auth.users to public.users
INSERT INTO public.users (id, email, role, status)
SELECT id, email, 'user', 'active'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

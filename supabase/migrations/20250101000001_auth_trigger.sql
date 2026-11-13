-- ==============================================================================
-- SEWDESK — AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGN-UP
-- Migration: 20250101000001_auth_trigger.sql
-- ==============================================================================
-- When a new user signs up via Supabase Auth, this trigger automatically
-- inserts a matching row into public.profiles, eliminating FK violations
-- when createBusiness() is called during onboarding.
-- ==============================================================================

-- Function: called after INSERT on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email     = COALESCE(EXCLUDED.email,     public.profiles.email),
      updated_at = NOW()
  WHERE public.profiles.full_name IS NULL OR public.profiles.full_name = '';

  RETURN NEW;
END;
$$;

-- Trigger: fires after every new auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS: allow authenticated users to insert their own profile
-- (defensive — the trigger runs SECURITY DEFINER and bypasses RLS,
-- but this policy is needed for direct upserts from the client)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can insert own profile"
        ON public.profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid())
    $policy$;
  END IF;
END $$;

-- RLS: allow authenticated users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
    $policy$;
  END IF;
END $$;


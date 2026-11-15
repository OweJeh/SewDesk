-- ==============================================================================
-- SEWDESK — PLATFORM ADMIN ACCESS HARD-LOCK & RLS POLICIES
-- Migration: 20250101000003_platform_admin_hardlock.sql
-- ==============================================================================
-- Hard-locks platform admin access to owusujunior2004@gmail.com and grants
-- unrestricted multi-tenant overview permissions across all tenant profiles,
-- businesses, members, customers, orders, and payments.
-- ==============================================================================

-- 1. Redefine is_platform_admin() function with email hard-lock
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    -- Direct email check on JWT claims
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
    OR
    -- Direct profile email check
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND LOWER(email) = 'owusujunior2004@gmail.com'
    )
    OR
    -- platform_admins registry check
    EXISTS (
      SELECT 1 FROM public.platform_admins
      WHERE profile_id = auth.uid()
    );
$$;

-- 2. Ensure owusujunior2004@gmail.com is registered in platform_admins
INSERT INTO public.platform_admins (profile_id)
SELECT id FROM public.profiles
WHERE LOWER(email) = 'owusujunior2004@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Update auth trigger to automatically register owusujunior2004@gmail.com as platform admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into public.profiles
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

  -- Automatically grant platform admin if email matches
  IF LOWER(NEW.email) = 'owusujunior2004@gmail.com' THEN
    INSERT INTO public.platform_admins (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. PROFILES: Allow platform admin to view ALL user profiles
DROP POLICY IF EXISTS "Platform admin can view all profiles" ON public.profiles;
CREATE POLICY "Platform admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 5. BUSINESSES: Allow platform admin to view ALL businesses
DROP POLICY IF EXISTS "Platform admin can view all businesses" ON public.businesses;
CREATE POLICY "Platform admin can view all businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 6. BUSINESS MEMBERS: Allow platform admin to view ALL business members
DROP POLICY IF EXISTS "Platform admin can view all members" ON public.business_members;
CREATE POLICY "Platform admin can view all members"
  ON public.business_members FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 7. CUSTOMERS: Allow platform admin to view ALL customers
DROP POLICY IF EXISTS "Platform admin can view all customers" ON public.customers;
CREATE POLICY "Platform admin can view all customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 8. ORDERS: Allow platform admin to view ALL orders
DROP POLICY IF EXISTS "Platform admin can view all orders" ON public.orders;
CREATE POLICY "Platform admin can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 9. PAYMENTS: Allow platform admin to view ALL payments
DROP POLICY IF EXISTS "Platform admin can view all payments" ON public.payments;
CREATE POLICY "Platform admin can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- 10. PLATFORM ADMINS: Allow platform admin to manage platform_admins table
DROP POLICY IF EXISTS "Platform admin manage platform_admins" ON public.platform_admins;
CREATE POLICY "Platform admin manage platform_admins"
  ON public.platform_admins FOR ALL
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  )
  WITH CHECK (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );


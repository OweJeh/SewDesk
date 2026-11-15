-- ==============================================================================
-- SEWDESK — PLATFORM SUBSCRIPTION SYSTEM & STUDIO OVERRIDES
-- Migration: 20250101000004_platform_subscription_system.sql
-- ==============================================================================
-- Provides database persistence for:
-- 1. Platform-wide subscription configuration (trial rules, customer quota, pricing, data-lock)
-- 2. Per-studio subscription overrides (custom limits, forced tier, data lock, grace periods)
-- 3. Base Workspace (GH₵ 50/mo) and Pro Atelier (GH₵ 150/mo) plans in subscription_plans
-- 4. Subscriptions table upgrades (unique business constraint, flexible plan slug/id)
-- 5. Row Level Security policies for platform admin control & studio member access
-- ==============================================================================

-- 1. PLATFORM SUBSCRIPTION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_subscription_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  trial_type TEXT NOT NULL DEFAULT 'both' CHECK (trial_type IN ('both', 'customer_quota', 'trial_days')),
  free_customer_limit INT NOT NULL DEFAULT 15,
  free_trial_days INT NOT NULL DEFAULT 14,
  base_tier_price_ghs NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  pro_tier_price_ghs NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  lock_data_when_expired BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial global settings if not present
INSERT INTO public.platform_subscription_settings (
  id,
  trial_type,
  free_customer_limit,
  free_trial_days,
  base_tier_price_ghs,
  pro_tier_price_ghs,
  lock_data_when_expired,
  updated_at
)
VALUES (
  'global',
  'both',
  15,
  14,
  50.00,
  150.00,
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. STUDIO SUBSCRIPTION OVERRIDES TABLE
CREATE TABLE IF NOT EXISTS public.studio_subscription_overrides (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  custom_customer_limit INT,
  custom_lock_data BOOLEAN,
  force_tier TEXT CHECK (force_tier IN ('free_trial', 'base', 'pro', 'expired')),
  grace_period_until TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by business_id
CREATE INDEX IF NOT EXISTS idx_studio_overrides_business_id ON public.studio_subscription_overrides(business_id);

-- 3. UPDATE SUBSCRIPTION PLANS (Ensure Base Studio GH₵ 50 & Pro Studio GH₵ 150 exist)
-- Add slug column to subscription_plans if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscription_plans' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.subscription_plans ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Update existing plans with slugs
UPDATE public.subscription_plans SET slug = 'free_trial' WHERE name = 'Free Starter' AND (slug IS NULL OR slug = '');
UPDATE public.subscription_plans SET slug = 'pro_studio' WHERE name = 'Pro Tailor Studio' AND (slug IS NULL OR slug = '');

-- Insert or update Free, Base, and Pro plans
INSERT INTO public.subscription_plans (name, slug, price, currency, billing_interval, free_customer_allowance, is_active)
VALUES
  ('Free Starter', 'free_trial', 0.00, 'GHS', 'monthly', 15, TRUE),
  ('Base Workspace', 'base_studio', 50.00, 'GHS', 'monthly', 1000000, TRUE),
  ('Pro Tailor Studio', 'pro_studio', 150.00, 'GHS', 'monthly', 1000000, TRUE)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  free_customer_allowance = EXCLUDED.free_customer_allowance,
  is_active = TRUE;

-- 4. UPGRADE SUBSCRIPTIONS TABLE
-- Make sure business_id is UNIQUE on public.subscriptions so upserts work cleanly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_business_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_business_id_key UNIQUE (business_id);
  END IF;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
  NULL;
END $$;

-- Make sure plan_id in subscriptions can store text slugs ('base_studio', 'pro_studio') or UUIDs
-- If foreign key constraint exists, drop it to allow flexible slug storage:
DO $$
DECLARE
  v_fk_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO v_fk_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'subscriptions'
    AND kcu.column_name = 'plan_id'
  LIMIT 1;

  IF v_fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS ' || quote_ident(v_fk_name);
  END IF;
  
  -- Alter plan_id column type to TEXT if it's currently UUID
  ALTER TABLE public.subscriptions ALTER COLUMN plan_id TYPE TEXT USING plan_id::TEXT;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.platform_subscription_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_subscription_overrides ENABLE ROW LEVEL SECURITY;

-- platform_subscription_settings: Read access for all authenticated and anon users
DROP POLICY IF EXISTS "Anyone can read platform subscription settings" ON public.platform_subscription_settings;
CREATE POLICY "Anyone can read platform subscription settings"
  ON public.platform_subscription_settings FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- platform_subscription_settings: Write access strictly restricted to platform admin
DROP POLICY IF EXISTS "Platform admin can manage subscription settings" ON public.platform_subscription_settings;
CREATE POLICY "Platform admin can manage subscription settings"
  ON public.platform_subscription_settings FOR ALL
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  )
  WITH CHECK (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- studio_subscription_overrides: Platform admin can view all overrides
DROP POLICY IF EXISTS "Platform admin can view all studio overrides" ON public.studio_subscription_overrides;
CREATE POLICY "Platform admin can view all studio overrides"
  ON public.studio_subscription_overrides FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- studio_subscription_overrides: Studio members can view their own studio's override
DROP POLICY IF EXISTS "Studio members can view own override" ON public.studio_subscription_overrides;
CREATE POLICY "Studio members can view own override"
  ON public.studio_subscription_overrides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_members.business_id = studio_subscription_overrides.business_id
        AND business_members.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = studio_subscription_overrides.business_id
        AND businesses.owner_profile_id = auth.uid()
    )
  );

-- studio_subscription_overrides: Only platform admin can insert/update/delete overrides
DROP POLICY IF EXISTS "Platform admin can manage studio overrides" ON public.studio_subscription_overrides;
CREATE POLICY "Platform admin can manage studio overrides"
  ON public.studio_subscription_overrides FOR ALL
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  )
  WITH CHECK (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- subscriptions: Allow platform admin to view and manage all subscriptions
DROP POLICY IF EXISTS "Platform admin can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Platform admin can manage all subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  )
  WITH CHECK (
    public.is_platform_admin() OR
    (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  );

-- subscriptions: Allow business owners to insert/update their studio's subscription
DROP POLICY IF EXISTS "Business owners can manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Business owners can manage own subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = subscriptions.business_id
        AND businesses.owner_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = subscriptions.business_id
        AND businesses.owner_profile_id = auth.uid()
    )
  );

-- 6. HELPER FUNCTION TO EVALUATE STUDIO ACCESS STATUS
CREATE OR REPLACE FUNCTION public.get_studio_access_status(p_business_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_biz RECORD;
  v_sub RECORD;
  v_cfg RECORD;
  v_override RECORD;
  v_effective_limit INT;
  v_age_days INT;
  v_is_expired BOOLEAN := FALSE;
  v_is_locked BOOLEAN := FALSE;
  v_tier TEXT := 'free_trial';
BEGIN
  -- Fetch business
  SELECT * INTO v_biz FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Business not found');
  END IF;

  -- Fetch global config
  SELECT * INTO v_cfg FROM public.platform_subscription_settings WHERE id = 'global';
  IF NOT FOUND THEN
    v_cfg.free_customer_limit := 15;
    v_cfg.free_trial_days := 14;
    v_cfg.lock_data_when_expired := TRUE;
    v_cfg.trial_type := 'both';
  END IF;

  -- Fetch studio override
  SELECT * INTO v_override FROM public.studio_subscription_overrides WHERE business_id = p_business_id;

  -- Fetch active subscription
  SELECT * INTO v_sub FROM public.subscriptions
  WHERE business_id = p_business_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;

  -- Determine effective limit
  v_effective_limit := COALESCE(v_override.custom_customer_limit, v_cfg.free_customer_limit);

  -- Determine tier
  IF v_override.force_tier IS NOT NULL THEN
    v_tier := v_override.force_tier;
  ELSIF v_sub.id IS NOT NULL THEN
    v_tier := CASE WHEN v_sub.plan_id = 'base_studio' THEN 'base' ELSE 'pro' END;
  ELSIF v_biz.customer_slots_used > 100 THEN
    v_tier := 'pro';
  ELSE
    -- Calculate trial age
    v_age_days := FLOOR(EXTRACT(EPOCH FROM (NOW() - v_biz.created_at)) / 86400);
    
    IF v_cfg.trial_type = 'customer_quota' THEN
      v_is_expired := (v_biz.customer_slots_used >= v_effective_limit);
    ELSIF v_cfg.trial_type = 'trial_days' THEN
      v_is_expired := (v_age_days >= v_cfg.free_trial_days);
    ELSE
      v_is_expired := (v_biz.customer_slots_used >= v_effective_limit) OR (v_age_days >= v_cfg.free_trial_days);
    END IF;

    -- Check grace period override
    IF v_override.grace_period_until IS NOT NULL AND v_override.grace_period_until > NOW() THEN
      v_is_expired := FALSE;
    END IF;

    IF v_is_expired THEN
      v_tier := 'expired';
    ELSE
      v_tier := 'free_trial';
    END IF;
  END IF;

  -- Determine data lock
  IF v_override.custom_lock_data IS NOT NULL THEN
    v_is_locked := v_override.custom_lock_data;
  ELSIF v_tier = 'expired' AND COALESCE(v_cfg.lock_data_when_expired, TRUE) THEN
    v_is_locked := TRUE;
  ELSE
    v_is_locked := FALSE;
  END IF;

  RETURN jsonb_build_object(
    'business_id', p_business_id,
    'tier', v_tier,
    'is_data_locked', v_is_locked,
    'customer_slots_used', v_biz.customer_slots_used,
    'effective_limit', v_effective_limit,
    'free_customer_limit', v_cfg.free_customer_limit,
    'base_price', v_cfg.base_tier_price_ghs,
    'pro_price', v_cfg.pro_tier_price_ghs
  );
END;
$$;

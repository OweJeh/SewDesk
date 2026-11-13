-- ==============================================================================
-- SEWDESK — INITIAL COMPLETE POSTGRESQL MULTI-TENANT SCHEMA & RLS
-- Migration: 20250101000000_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE business_role AS ENUM ('owner', 'admin', 'tailor', 'assistant', 'accountant');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('not_started', 'cutting', 'sewing', 'fitting', 'ready', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'bank_transfer', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('free', 'active', 'pending_payment', 'expired', 'cancelled', 'payment_failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE measurement_unit AS ENUM ('cm', 'inch');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE IDENTITY & PLATFORM ADMINISTRATION
-- ------------------------------------------------------------------------------

-- User Profiles (linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Administrators (strictly isolated from business profiles)
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  granted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TENANCY: BUSINESSES & MEMBERSHIP
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'Bespoke Tailoring',
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  country TEXT NOT NULL DEFAULT 'Ghana',
  region TEXT,
  city TEXT NOT NULL,
  logo_url TEXT,
  default_currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  default_measurement_unit measurement_unit NOT NULL DEFAULT 'cm',
  customer_slots_used INT NOT NULL DEFAULT 0 CHECK (customer_slots_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role business_role NOT NULL DEFAULT 'tailor',
  invitation_status TEXT NOT NULL DEFAULT 'active' CHECK (invitation_status IN ('active', 'suspended')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.business_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role business_role NOT NULL DEFAULT 'tailor',
  invitation_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.member_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_member_id UUID NOT NULL REFERENCES public.business_members(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_member_id, permission_key)
);

-- ------------------------------------------------------------------------------
-- 4. SUBSCRIPTION & BILLING
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  free_customer_allowance INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'free',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  provider TEXT NOT NULL CHECK (provider IN ('paystack', 'hubtel', 'manual')),
  provider_reference TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  verified_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. CUSTOMER MANAGEMENT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  measurement_profile TEXT DEFAULT 'Standard',
  location TEXT,
  photo_url TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  UNIQUE (business_id, customer_number)
);

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. MEASUREMENT MANAGEMENT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.measurement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Upper Body',
  default_unit measurement_unit NOT NULL DEFAULT 'cm',
  validation_min NUMERIC(6, 2) NOT NULL DEFAULT 5.0,
  validation_max NUMERIC(6, 2) NOT NULL DEFAULT 250.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.measurement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE, -- NULL means global system template
  name TEXT NOT NULL,
  description TEXT,
  profile_type TEXT NOT NULL DEFAULT 'Custom', -- 'Male', 'Female', 'Children', 'Custom'
  is_system_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.measurement_templates(id) ON DELETE CASCADE,
  measurement_definition_id UUID NOT NULL REFERENCES public.measurement_definitions(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, measurement_definition_id)
);

CREATE TABLE IF NOT EXISTS public.measurement_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.measurement_templates(id),
  garment_type TEXT NOT NULL DEFAULT 'General Body Fit',
  session_name TEXT NOT NULL,
  fit_notes TEXT,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.measurement_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_set_id UUID NOT NULL REFERENCES public.measurement_sets(id) ON DELETE CASCADE,
  measurement_definition_id UUID REFERENCES public.measurement_definitions(id),
  field_name TEXT NOT NULL,
  original_value NUMERIC(6, 2) NOT NULL,
  original_unit measurement_unit NOT NULL DEFAULT 'cm',
  canonical_cm_value NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS & WORKSHOP PRODUCTION
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL,
  garment_type TEXT NOT NULL,
  description TEXT,
  fabric TEXT,
  colour TEXT,
  style TEXT,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  measurement_set_id UUID NOT NULL REFERENCES public.measurement_sets(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  status order_status NOT NULL DEFAULT 'not_started',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, order_number)
);

CREATE TABLE IF NOT EXISTS public.order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  note TEXT,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fittings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  fitting_date DATE NOT NULL,
  notes TEXT,
  alterations_required TEXT,
  completed_at TIMESTAMPTZ,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. PAYMENTS & FINANCIAL MANAGEMENT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  method payment_method NOT NULL DEFAULT 'cash',
  reference TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'pending')),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  reference TEXT,
  processed_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS, AUDIT & SYNC
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sync_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_operation_id TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_business_members_profile ON public.business_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_measurement_sets_customer ON public.measurement_sets(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(business_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_business ON public.payments(business_id);

-- ------------------------------------------------------------------------------
-- 11. SECURITY DEFINER HELPER FUNCTIONS (PREVENTS RLS RECURSION)
-- ------------------------------------------------------------------------------

-- Returns whether current auth.uid() is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE profile_id = auth.uid()
  );
$$;

-- Returns whether current auth.uid() belongs to a given business
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = b_id
      AND profile_id = auth.uid()
      AND invitation_status = 'active'
  );
$$;

-- Returns whether current auth.uid() is the business Owner
CREATE OR REPLACE FUNCTION public.is_business_owner(b_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = b_id
      AND owner_profile_id = auth.uid()
  );
$$;

-- Returns whether current auth.uid() has one of the specified roles in a business
CREATE OR REPLACE FUNCTION public.has_business_role(b_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = b_id
      AND profile_id = auth.uid()
      AND role::TEXT = ANY(allowed_roles)
      AND invitation_status = 'active'
  );
$$;

-- ------------------------------------------------------------------------------
-- 12. ATOMIC CUSTOMER REGISTRATION RPC WITH ENTITLEMENT ENFORCEMENT
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.register_customer_atomic(
  p_business_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_whatsapp TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_measurement_profile TEXT DEFAULT 'Standard',
  p_location TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_slots_used INT;
  v_has_active_sub BOOLEAN;
  v_new_customer_id UUID;
  v_next_num_seq INT;
  v_customer_num TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  -- 1. Verify business membership and write permissions
  IF NOT (
    public.is_business_owner(p_business_id) OR
    public.has_business_role(p_business_id, ARRAY['admin', 'tailor', 'assistant'])
  ) THEN
    RAISE EXCEPTION 'Permission denied to register customer in this business.';
  END IF;

  -- 2. Concurrency-safe row locking on business record
  SELECT customer_slots_used INTO v_slots_used
  FROM public.businesses
  WHERE id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found.';
  END IF;

  -- 3. Check subscription entitlement if >= 100
  IF v_slots_used >= 100 THEN
    SELECT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE business_id = p_business_id
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_has_active_sub;

    IF NOT v_has_active_sub THEN
      RAISE EXCEPTION 'CUSTOMER_ALLOWANCE_EXCEEDED: Free allowance of 100 customers reached. An active paid subscription (GHS 150/mo) is required to register additional customers.';
    END IF;
  END IF;

  -- 4. Calculate formatted customer number
  v_next_num_seq := v_slots_used + 1;
  v_customer_num := 'CUST-' || LPAD(v_next_num_seq::TEXT, 4, '0');

  -- 5. Insert new customer
  INSERT INTO public.customers (
    business_id,
    customer_number,
    full_name,
    phone,
    whatsapp,
    email,
    measurement_profile,
    location,
    notes,
    created_by
  ) VALUES (
    p_business_id,
    v_customer_num,
    p_full_name,
    p_phone,
    p_whatsapp,
    p_email,
    p_measurement_profile,
    p_location,
    p_notes,
    v_user_id
  ) RETURNING id INTO v_new_customer_id;

  -- 6. Increment lifetime slot count atomically
  UPDATE public.businesses
  SET customer_slots_used = customer_slots_used + 1,
      updated_at = NOW()
  WHERE id = p_business_id;

  -- 7. Record activity log
  INSERT INTO public.customer_activity (
    business_id,
    customer_id,
    activity_type,
    description,
    created_by
  ) VALUES (
    p_business_id,
    v_new_customer_id,
    'customer_registered',
    'Customer registered by staff',
    v_user_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'customer_id', v_new_customer_id,
    'customer_number', v_customer_num,
    'slots_used', v_next_num_seq
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fittings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles viewable by self or fellow business members"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR
    public.is_platform_admin() OR
    EXISTS (
      SELECT 1 FROM public.business_members bm1
      JOIN public.business_members bm2 ON bm1.business_id = bm2.business_id
      WHERE bm1.profile_id = auth.uid() AND bm2.profile_id = profiles.id
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- PLATFORM ADMINS
CREATE POLICY "Platform admins can view platform admin list"
  ON public.platform_admins FOR SELECT
  USING (public.is_platform_admin());

-- BUSINESSES
CREATE POLICY "Businesses viewable by members or platform admin"
  ON public.businesses FOR SELECT
  USING (
    public.is_business_member(id) OR
    owner_profile_id = auth.uid() OR
    public.is_platform_admin()
  );

CREATE POLICY "Business owners can update business profile"
  ON public.businesses FOR UPDATE
  USING (owner_profile_id = auth.uid());

CREATE POLICY "Authenticated users can create a new business"
  ON public.businesses FOR INSERT
  WITH CHECK (owner_profile_id = auth.uid());

-- BUSINESS MEMBERS
CREATE POLICY "Members viewable by fellow business members or platform admin"
  ON public.business_members FOR SELECT
  USING (
    public.is_business_member(business_id) OR
    public.is_platform_admin()
  );

CREATE POLICY "Owner or Admin can manage business members"
  ON public.business_members FOR ALL
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['admin'])
  );

-- CUSTOMERS
CREATE POLICY "Customers viewable by business members"
  ON public.customers FOR SELECT
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customers insertable by authorized business members"
  ON public.customers FOR INSERT
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customers editable by authorized business members"
  ON public.customers FOR UPDATE
  USING (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customers deletable by authorized business members"
  ON public.customers FOR DELETE
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

-- CUSTOMER NOTES
CREATE POLICY "Customer notes viewable by business members"
  ON public.customer_notes FOR SELECT
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customer notes insertable by authorized business members"
  ON public.customer_notes FOR INSERT
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customer notes deletable by author or owner or admin"
  ON public.customer_notes FOR DELETE
  USING (
    created_by = auth.uid() OR
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

-- CUSTOMER ACTIVITY
CREATE POLICY "Customer activity viewable by business members"
  ON public.customer_activity FOR SELECT
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

CREATE POLICY "Customer activity insertable by business members"
  ON public.customer_activity FOR INSERT
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant', 'accountant']) OR
    public.is_platform_admin()
  );

-- MEASUREMENTS
CREATE POLICY "Measurement definitions readable by all authenticated users"
  ON public.measurement_definitions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Measurement templates viewable by business members or if system template"
  ON public.measurement_templates FOR SELECT
  USING (
    is_system_template = true OR
    (business_id IS NOT NULL AND public.is_business_member(business_id))
  );

CREATE POLICY "Template fields readable if template is visible"
  ON public.template_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.measurement_templates t
      WHERE t.id = template_id AND (
        t.is_system_template = true OR
        (t.business_id IS NOT NULL AND public.is_business_member(t.business_id))
      )
    )
  );

CREATE POLICY "Measurement sets viewable by business members"
  ON public.measurement_sets FOR SELECT
  USING (public.is_business_member(business_id));

CREATE POLICY "Measurement sets insertable by authorized tailors/admins"
  ON public.measurement_sets FOR INSERT
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['admin', 'tailor'])
  );

CREATE POLICY "Measurement values readable by business members"
  ON public.measurement_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.measurement_sets ms
      WHERE ms.id = measurement_set_id AND public.is_business_member(ms.business_id)
    )
  );

CREATE POLICY "Measurement values insertable with measurement set"
  ON public.measurement_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.measurement_sets ms
      WHERE ms.id = measurement_set_id AND (
        public.is_business_owner(ms.business_id) OR
        public.has_business_role(ms.business_id, ARRAY['admin', 'tailor'])
      )
    )
  );

-- ORDERS
CREATE POLICY "Orders viewable by business members"
  ON public.orders FOR SELECT
  USING (public.is_business_member(business_id) OR public.is_platform_admin());

CREATE POLICY "Orders insertable and updatable by permitted staff"
  ON public.orders FOR ALL
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['admin', 'tailor', 'assistant'])
  );

-- PAYMENTS
CREATE POLICY "Payments viewable by business members with financial access"
  ON public.payments FOR SELECT
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['admin', 'accountant'])
  );

CREATE POLICY "Payments insertable by Owner, Admin or Accountant"
  ON public.payments FOR INSERT
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['admin', 'accountant'])
  );

-- SUBSCRIPTIONS
CREATE POLICY "Subscription plans readable by all"
  ON public.subscription_plans FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Business subscriptions readable by members"
  ON public.subscriptions FOR SELECT
  USING (public.is_business_member(business_id) OR public.is_platform_admin());

-- NOTIFICATIONS
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_profile_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (recipient_profile_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 14. SEED INITIAL DATA (DEFAULT PLANS & STANDARD MEASUREMENTS)
-- ------------------------------------------------------------------------------

INSERT INTO public.subscription_plans (name, price, currency, billing_interval, free_customer_allowance, is_active)
VALUES
  ('Free Starter', 0.00, 'GHS', 'monthly', 100, TRUE),
  ('Pro Tailor Studio', 150.00, 'GHS', 'monthly', 100, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed Standard Male Measurement Template
DO $$
DECLARE
  v_tmpl_male_id UUID;
  v_def_id UUID;
BEGIN
  -- Insert or fetch Male System Template
  SELECT id INTO v_tmpl_male_id FROM public.measurement_templates WHERE name = 'Standard Male Bespoke' AND is_system_template = TRUE;
  IF v_tmpl_male_id IS NULL THEN
    INSERT INTO public.measurement_templates (name, description, profile_type, is_system_template)
    VALUES ('Standard Male Bespoke', 'Comprehensive measurements for suits, kaftans, shirts, and trousers', 'Male', TRUE)
    RETURNING id INTO v_tmpl_male_id;
  END IF;

  -- Standard Male Definitions
  INSERT INTO public.measurement_definitions (name, description, category, default_unit, validation_min, validation_max)
  VALUES
    ('Neck', 'Circumference around the base of the neck', 'Upper Body', 'cm', 25.0, 60.0),
    ('Shoulder', 'Tip of shoulder bone to tip of shoulder bone across back', 'Upper Body', 'cm', 30.0, 70.0),
    ('Chest', 'Fullest part of chest under the armpits', 'Upper Body', 'cm', 60.0, 160.0),
    ('Waist', 'Natural waistline above navel', 'Torso', 'cm', 50.0, 160.0),
    ('Hip / Seat', 'Fullest part of buttocks/seat', 'Lower Body', 'cm', 60.0, 170.0),
    ('Sleeve Length', 'From shoulder seam to wrist bone', 'Arms', 'cm', 40.0, 95.0),
    ('Armhole', 'Circumference around the shoulder joint and armpit', 'Arms', 'cm', 30.0, 75.0),
    ('Bicep', 'Fullest point of upper arm', 'Arms', 'cm', 20.0, 60.0),
    ('Shirt Length', 'Base of collar down to desired hemline', 'Upper Body', 'cm', 50.0, 120.0),
    ('Trouser Length', 'Waistband to bottom shoe hemline', 'Lower Body', 'cm', 70.0, 130.0),
    ('Inseam', 'Crotch seam to bottom trouser hem', 'Lower Body', 'cm', 50.0, 105.0),
    ('Thigh', 'Circumference around upper thigh below crotch', 'Lower Body', 'cm', 35.0, 90.0),
    ('Knee', 'Circumference around the knee joint', 'Lower Body', 'cm', 25.0, 65.0),
    ('Ankle / Hem', 'Opening circumference at bottom of trousers', 'Lower Body', 'cm', 20.0, 50.0),
    ('Crotch Depth', 'Waist to chair surface when seated upright', 'Lower Body', 'cm', 18.0, 45.0)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Seed Standard Female Measurement Template
DO $$
DECLARE
  v_tmpl_female_id UUID;
BEGIN
  SELECT id INTO v_tmpl_female_id FROM public.measurement_templates WHERE name = 'Standard Female Bespoke' AND is_system_template = TRUE;
  IF v_tmpl_female_id IS NULL THEN
    INSERT INTO public.measurement_templates (name, description, profile_type, is_system_template)
    VALUES ('Standard Female Bespoke', 'Comprehensive measurements for gowns, kaba & slit, corsets, blouses', 'Female', TRUE)
    RETURNING id INTO v_tmpl_female_id;
  END IF;

  INSERT INTO public.measurement_definitions (name, description, category, default_unit, validation_min, validation_max)
  VALUES
    ('Bust', 'Fullest point across the bust', 'Upper Body', 'cm', 60.0, 170.0),
    ('Under Bust', 'Ribcage directly beneath the bust', 'Upper Body', 'cm', 50.0, 150.0),
    ('High Hip', 'Over hip bones approximately 3 inches below waist', 'Lower Body', 'cm', 60.0, 160.0),
    ('Full Hip', 'Widest part of hips and buttocks', 'Lower Body', 'cm', 70.0, 180.0),
    ('Shoulder to Waist', 'Shoulder near neck over bust to natural waist', 'Torso', 'cm', 30.0, 65.0),
    ('Blouse Length', 'Shoulder to desired blouse hemline', 'Torso', 'cm', 40.0, 90.0),
    ('Dress Length', 'Shoulder over bust to desired dress hemline', 'Full Body', 'cm', 70.0, 170.0),
    ('Skirt Length', 'Natural waist down to skirt hemline', 'Lower Body', 'cm', 35.0, 130.0),
    ('Bust Point', 'Shoulder neck point to apex of bust', 'Torso', 'cm', 18.0, 45.0),
    ('Bust Separation', 'Distance between bust apex points', 'Torso', 'cm', 12.0, 30.0)
  ON CONFLICT (name) DO NOTHING;
END $$;


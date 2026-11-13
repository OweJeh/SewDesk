-- ==============================================================================
-- SEWDESK — COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES FIX
-- Migration: 20250101000002_fix_rls_policies.sql
-- ==============================================================================
-- Resolves "new row violates row-level security policy for table customers"
-- and provides complete INSERT, UPDATE, and DELETE coverage for all multi-tenant tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CUSTOMERS TABLE POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers insertable by authorized business members" ON public.customers;
CREATE POLICY "Customers insertable by authorized business members"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customers editable by authorized business members" ON public.customers;
CREATE POLICY "Customers editable by authorized business members"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customers deletable by authorized business members" ON public.customers;
CREATE POLICY "Customers deletable by authorized business members"
  ON public.customers FOR DELETE
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customers viewable by business members" ON public.customers;
CREATE POLICY "Customers viewable by business members"
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 2. CUSTOMER NOTES & TIMELINE ACTIVITY
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customer notes viewable by business members" ON public.customer_notes;
CREATE POLICY "Customer notes viewable by business members"
  ON public.customer_notes FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customer notes insertable by authorized business members" ON public.customer_notes;
CREATE POLICY "Customer notes insertable by authorized business members"
  ON public.customer_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customer notes deletable by author or owner or admin" ON public.customer_notes;
CREATE POLICY "Customer notes deletable by author or owner or admin"
  ON public.customer_notes FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customer activity viewable by business members" ON public.customer_activity;
CREATE POLICY "Customer activity viewable by business members"
  ON public.customer_activity FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Customer activity insertable by business members" ON public.customer_activity;
CREATE POLICY "Customer activity insertable by business members"
  ON public.customer_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.is_business_member(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor', 'assistant', 'accountant']) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 3. BUSINESSES TABLE UPDATE POLICY
-- ------------------------------------------------------------------------------
-- Allows staff to update slots counter or business profile when authorized
DROP POLICY IF EXISTS "Authorized members can update business" ON public.businesses;
CREATE POLICY "Authorized members can update business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (
    public.is_business_owner(id) OR
    public.has_business_role(id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 4. BUSINESS INVITATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Business invitations viewable by members or invited email" ON public.business_invitations;
CREATE POLICY "Business invitations viewable by members or invited email"
  ON public.business_invitations FOR SELECT
  TO authenticated
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Business invitations insertable by owner or admin" ON public.business_invitations;
CREATE POLICY "Business invitations insertable by owner or admin"
  ON public.business_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Business invitations updatable by owner or admin" ON public.business_invitations;
CREATE POLICY "Business invitations updatable by owner or admin"
  ON public.business_invitations FOR UPDATE
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Business invitations deletable by owner or admin" ON public.business_invitations;
CREATE POLICY "Business invitations deletable by owner or admin"
  ON public.business_invitations FOR DELETE
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 5. MEASUREMENT SETS & VALUES UPDATE POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Measurement sets updatable by authorized tailors/admins" ON public.measurement_sets;
CREATE POLICY "Measurement sets updatable by authorized tailors/admins"
  ON public.measurement_sets FOR UPDATE
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'tailor']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Measurement values updatable by authorized tailors/admins" ON public.measurement_values;
CREATE POLICY "Measurement values updatable by authorized tailors/admins"
  ON public.measurement_values FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.measurement_sets ms
      WHERE ms.id = measurement_set_id AND (
        public.is_business_owner(ms.business_id) OR
        public.has_business_role(ms.business_id, ARRAY['owner', 'admin', 'tailor']) OR
        public.is_platform_admin()
      )
    )
  );

-- ------------------------------------------------------------------------------
-- 6. ORDER ATTACHMENTS, HISTORY & FITTINGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Order attachments viewable by business members" ON public.order_attachments;
CREATE POLICY "Order attachments viewable by business members"
  ON public.order_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (
        public.is_business_member(o.business_id) OR
        public.is_business_owner(o.business_id) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Order attachments manageable by permitted staff" ON public.order_attachments;
CREATE POLICY "Order attachments manageable by permitted staff"
  ON public.order_attachments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (
        public.is_business_owner(o.business_id) OR
        public.has_business_role(o.business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Order status history viewable by business members" ON public.order_status_history;
CREATE POLICY "Order status history viewable by business members"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (
        public.is_business_member(o.business_id) OR
        public.is_business_owner(o.business_id) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Order status history insertable by permitted staff" ON public.order_status_history;
CREATE POLICY "Order status history insertable by permitted staff"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (
        public.is_business_owner(o.business_id) OR
        public.has_business_role(o.business_id, ARRAY['owner', 'admin', 'tailor', 'assistant']) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Fittings manageable by business members" ON public.fittings;
CREATE POLICY "Fittings manageable by business members"
  ON public.fittings FOR ALL
  TO authenticated
  USING (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 7. REFUNDS & NOTIFICATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Refunds viewable by owner or accountant" ON public.refunds;
CREATE POLICY "Refunds viewable by owner or accountant"
  ON public.refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_id AND (
        public.is_business_owner(p.business_id) OR
        public.has_business_role(p.business_id, ARRAY['owner', 'admin', 'accountant']) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Refunds insertable by owner or admin" ON public.refunds;
CREATE POLICY "Refunds insertable by owner or admin"
  ON public.refunds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_id AND (
        public.is_business_owner(p.business_id) OR
        public.has_business_role(p.business_id, ARRAY['owner', 'admin']) OR
        public.is_platform_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Notifications insertable by business members or system" ON public.notifications;
CREATE POLICY "Notifications insertable by business members or system"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    recipient_profile_id = auth.uid() OR
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Notifications deletable by recipient" ON public.notifications;
CREATE POLICY "Notifications deletable by recipient"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (recipient_profile_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOGS & PAYMENT TRANSACTIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit logs viewable by owner or admin" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by owner or admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Audit logs insertable by business members" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by business members"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_member(business_id) OR
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Payment transactions viewable by owner or accountant" ON public.payment_transactions;
CREATE POLICY "Payment transactions viewable by owner or accountant"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'accountant']) OR
    public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Payment transactions insertable by authorized staff" ON public.payment_transactions;
CREATE POLICY "Payment transactions insertable by authorized staff"
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_business_owner(business_id) OR
    public.has_business_role(business_id, ARRAY['owner', 'admin', 'accountant']) OR
    public.is_platform_admin()
  );

-- ------------------------------------------------------------------------------
-- 9. SUBSCRIPTIONS MANAGEMENT
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Subscriptions manageable by owner or platform admin" ON public.subscriptions;
CREATE POLICY "Subscriptions manageable by owner or platform admin"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    public.is_business_owner(business_id) OR
    public.is_platform_admin()
  );


-- ==============================================================================
-- SEWDESK — SEED DATA FOR LOCAL DEVELOPMENT & STAGING TESTING
-- ==============================================================================

-- Test Plans
INSERT INTO public.subscription_plans (id, name, price, currency, billing_interval, free_customer_allowance, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Free Starter', 0.00, 'GHS', 'monthly', 100, TRUE),
  ('00000000-0000-0000-0000-000000000002', 'Pro Tailor Studio', 150.00, 'GHS', 'monthly', 100, TRUE)
ON CONFLICT (id) DO NOTHING;

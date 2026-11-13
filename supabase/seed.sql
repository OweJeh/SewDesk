-- ==============================================================================
-- SEWDESK — SEED DATA FOR LOCAL DEVELOPMENT & STAGING TESTING
-- ==============================================================================

-- Subscription Plans (conflict on unique name column so it can be run safely any number of times)
INSERT INTO public.subscription_plans (name, price, currency, billing_interval, free_customer_allowance, is_active)
VALUES
  ('Free Starter', 0.00, 'GHS', 'monthly', 100, TRUE),
  ('Pro Tailor Studio', 150.00, 'GHS', 'monthly', 100, TRUE)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  billing_interval = EXCLUDED.billing_interval,
  free_customer_allowance = EXCLUDED.free_customer_allowance,
  is_active = EXCLUDED.is_active;

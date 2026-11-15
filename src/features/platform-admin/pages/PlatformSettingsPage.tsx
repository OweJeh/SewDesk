import React, { useState, useEffect } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  ShieldCheck,
  Database,
  Key,
  HardDrive,
  Download,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Sliders,
  CheckCircle2,
  Server,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';
import type { Business, Customer, Order, Payment } from '@/types';
import { getSubscriptionConfig } from '@/features/subscriptions/services/subscriptionConfig';

export const PlatformSettingsPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [tableCounts, setTableCounts] = useState<{ [table: string]: number }>({});
  const [storageEstimate, setStorageEstimate] = useState<{ usage: string; quota: string }>({ usage: '0 MB', quota: '0 MB' });
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSubSql, setCopiedSubSql] = useState(false);
  const [subConfig, setSubConfig] = useState(getSubscriptionConfig());

  const isLive = isSupabaseConfigured();
  const activeEmail = profile?.email || user?.email || 'owusujunior2004@gmail.com';

  const loadTelemetry = async () => {
    try {
      let profCount = 0;
      let bizCount = 0;
      let custCount = 0;
      let ordCount = 0;
      let payCount = 0;
      let memCount = 0;
      let mCount = 0;

      if (isLive) {
        const [profRes, bizRes, custRes, ordRes, payRes, memRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact' }),
          supabase.from('businesses').select('*', { count: 'exact' }),
          supabase.from('customers').select('*', { count: 'exact' }),
          supabase.from('orders').select('*', { count: 'exact' }),
          supabase.from('payments').select('*', { count: 'exact' }),
          supabase.from('business_members').select('*', { count: 'exact' }),
        ]);

        const [localProf, localBiz, localCust, localOrd, localPay, localM] = await Promise.all([
          db.profiles.count(),
          db.businesses.count(),
          db.customers.count(),
          db.orders.count(),
          db.payments.count(),
          db.measurementSets.count(),
        ]);

        profCount = profRes.data && profRes.data.length > 0 ? profRes.data.length : (profRes.count ?? localProf);
        bizCount = bizRes.data && bizRes.data.length > 0 ? bizRes.data.length : (bizRes.count ?? localBiz);
        custCount = custRes.count ?? localCust;
        ordCount = ordRes.count ?? localOrd;
        payCount = payRes.count ?? localPay;
        memCount = memRes.count ?? 0;
        mCount = localM;
      } else {
        const [bCount, cCount, oCount, pCount, mCountLocal, prCount, mbCount] = await Promise.all([
          db.businesses.count(),
          db.customers.count(),
          db.orders.count(),
          db.payments.count(),
          db.measurementSets.count(),
          db.profiles.count(),
          db.businessMembers.count(),
        ]);
        bizCount = bCount;
        custCount = cCount;
        ordCount = oCount;
        payCount = pCount;
        mCount = mCountLocal;
        profCount = prCount;
        memCount = mbCount;
      }

      setTableCounts({
        profiles: profCount,
        businesses: bizCount,
        customers: custCount,
        orders: ordCount,
        payments: payCount,
        measurementSets: mCount,
        businessMembers: memCount,
      });

      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usageMB = ((est.usage || 0) / (1024 * 1024)).toFixed(2) + ' MB';
        const quotaMB = ((est.quota || 0) / (1024 * 1024)).toFixed(0) + ' MB';
        setStorageEstimate({ usage: usageMB, quota: quotaMB });
      }
    } catch (err) {
      console.error('Error loading telemetry:', err);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const handleCfgChange = () => setSubConfig(getSubscriptionConfig());
    window.addEventListener('sewdesk_subscription_config_changed', handleCfgChange);
    return () => window.removeEventListener('sewdesk_subscription_config_changed', handleCfgChange);
  }, [isLive]);

  // Copy SQL script for Supabase SQL Editor
  const handleCopySql = () => {
    const sql = `-- Run this in Supabase SQL Editor to grant owusujunior2004@gmail.com full multi-tenant visibility
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND LOWER(email) = 'owusujunior2004@gmail.com')
  OR EXISTS (SELECT 1 FROM public.platform_admins WHERE profile_id = auth.uid());
$$;

INSERT INTO public.platform_admins (profile_id)
SELECT id FROM public.profiles WHERE LOWER(email) = 'owusujunior2004@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;

DROP POLICY IF EXISTS "Platform admin can view all profiles" ON public.profiles;
CREATE POLICY "Platform admin can view all profiles" ON public.profiles FOR SELECT TO authenticated
USING (public.is_platform_admin() OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com');

DROP POLICY IF EXISTS "Platform admin can view all businesses" ON public.businesses;
CREATE POLICY "Platform admin can view all businesses" ON public.businesses FOR SELECT TO authenticated
USING (public.is_platform_admin() OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com');`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopySubscriptionSql = () => {
    const sql = `-- SEWDESK SUBSCRIPTION SYSTEM & STUDIO OVERRIDES MIGRATION
-- Run in Supabase SQL Editor to enable full cloud-synced subscription controls

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

INSERT INTO public.platform_subscription_settings (id, trial_type, free_customer_limit, free_trial_days, base_tier_price_ghs, pro_tier_price_ghs, lock_data_when_expired, updated_at)
VALUES ('global', 'both', 15, 14, 50.00, 150.00, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

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

ALTER TABLE public.platform_subscription_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_subscription_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read platform subscription settings" ON public.platform_subscription_settings;
CREATE POLICY "Anyone can read platform subscription settings" ON public.platform_subscription_settings FOR SELECT TO authenticated, anon USING (TRUE);

DROP POLICY IF EXISTS "Platform admin can manage subscription settings" ON public.platform_subscription_settings;
CREATE POLICY "Platform admin can manage subscription settings" ON public.platform_subscription_settings FOR ALL TO authenticated
USING (public.is_platform_admin() OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com'))
WITH CHECK (public.is_platform_admin() OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com'));

DROP POLICY IF EXISTS "Platform admin can view all studio overrides" ON public.studio_subscription_overrides;
CREATE POLICY "Platform admin can view all studio overrides" ON public.studio_subscription_overrides FOR SELECT TO authenticated
USING (public.is_platform_admin() OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com'));

DROP POLICY IF EXISTS "Studio members can view own override" ON public.studio_subscription_overrides;
CREATE POLICY "Studio members can view own override" ON public.studio_subscription_overrides FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.business_members WHERE business_members.business_id = studio_subscription_overrides.business_id AND business_members.profile_id = auth.uid()));

DROP POLICY IF EXISTS "Platform admin can manage studio overrides" ON public.studio_subscription_overrides;
CREATE POLICY "Platform admin can manage studio overrides" ON public.studio_subscription_overrides FOR ALL TO authenticated
USING (public.is_platform_admin() OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com'))
WITH CHECK (public.is_platform_admin() OR (LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'owusujunior2004@gmail.com'));`;

    navigator.clipboard.writeText(sql);
    setCopiedSubSql(true);
    setTimeout(() => setCopiedSubSql(false), 3000);
  };

  // Export full JSON dump
  const handleFullBackup = async () => {
    try {
      const backup = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        businesses: await db.businesses.toArray(),
        customers: await db.customers.toArray(),
        orders: await db.orders.toArray(),
        payments: await db.payments.toArray(),
        measurementSets: await db.measurementSets.toArray(),
        profiles: await db.profiles.toArray(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sewdesk-platform-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error backing up database:', err);
    }
  };

  // Seed demo data for rapid testing
  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const now = new Date().toISOString();
      const biz1Id = generateUUID();
      const biz2Id = generateUUID();

      const demoBiz1: Business = {
        id: biz1Id,
        business_name: 'Heritage Bespoke Atelier',
        business_type: 'Bespoke Tailoring',
        owner_profile_id: user?.id || generateUUID(),
        contact_email: 'heritage@bespoke.gh',
        phone: '+233 24 555 1010',
        country: 'Ghana',
        region: 'Greater Accra',
        city: 'Accra',
        default_currency: 'GHS',
        default_measurement_unit: 'cm',
        customer_slots_used: 120,
        created_at: now,
        updated_at: now,
      };

      const demoBiz2: Business = {
        id: biz2Id,
        business_name: 'Golden Thread Couture',
        business_type: 'Fashion Studio',
        owner_profile_id: generateUUID(),
        contact_email: 'goldenthread@accra.fashion',
        phone: '+233 20 888 2020',
        country: 'Ghana',
        region: 'Ashanti',
        city: 'Kumasi',
        default_currency: 'GHS',
        default_measurement_unit: 'inch',
        customer_slots_used: 45,
        created_at: now,
        updated_at: now,
      };

      await db.businesses.bulkPut([demoBiz1, demoBiz2]);

      const cust1Id = generateUUID();
      const cust2Id = generateUUID();

      const cust1: Customer = {
        id: cust1Id,
        business_id: biz1Id,
        customer_number: 'CUST-0001',
        full_name: 'Dr. Kwame Osei',
        phone: '+233 24 111 2233',
        email: 'kwame.osei@legon.edu.gh',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        total_orders: 2,
        total_spent: 3400,
        outstanding_balance: 600,
      };

      const cust2: Customer = {
        id: cust2Id,
        business_id: biz2Id,
        customer_number: 'CUST-0001',
        full_name: 'Abena Mensah',
        phone: '+233 27 999 8877',
        email: 'abena@mensah.com',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        total_orders: 1,
        total_spent: 1200,
        outstanding_balance: 0,
      };

      await db.customers.bulkPut([cust1, cust2]);

      const ord1Id = generateUUID();
      const ord2Id = generateUUID();

      const ord1: Order = {
        id: ord1Id,
        business_id: biz1Id,
        customer_id: cust1Id,
        order_number: 'ORD-0001',
        garment_type: 'Three-Piece Kaftan & Agbada',
        total_price: 3400,
        currency: 'GHS',
        measurement_set_id: generateUUID(),
        status: 'sewing',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        amount_paid: 2800,
        balance: 600,
      };

      const ord2: Order = {
        id: ord2Id,
        business_id: biz2Id,
        customer_id: cust2Id,
        order_number: 'ORD-0001',
        garment_type: 'Kente Formal Gown',
        total_price: 1200,
        currency: 'GHS',
        measurement_set_id: generateUUID(),
        status: 'delivered',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        amount_paid: 1200,
        balance: 0,
      };

      await db.orders.bulkPut([ord1, ord2]);

      const pay1: Payment = {
        id: generateUUID(),
        business_id: biz1Id,
        customer_id: cust1Id,
        order_id: ord1Id,
        amount: 2800,
        currency: 'GHS',
        method: 'mobile_money',
        reference: 'MTN-88291039',
        payment_date: now,
        status: 'completed',
        recorded_by: 'system',
        created_at: now,
      };

      const pay2: Payment = {
        id: generateUUID(),
        business_id: biz2Id,
        customer_id: cust2Id,
        order_id: ord2Id,
        amount: 1200,
        currency: 'GHS',
        method: 'cash',
        reference: 'CSH-RECEIPT-01',
        payment_date: now,
        status: 'completed',
        recorded_by: 'system',
        created_at: now,
      };

      await db.payments.bulkPut([pay1, pay2]);

      setSeedSuccess(true);
      await loadTelemetry();
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Settings & System Telemetry
            </h1>
            <Badge variant="default" className="bg-red-600 text-white text-[10px] font-mono">
              ROOT CONFIG
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global system parameters, operator access credentials, database storage metrics, and backups.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadTelemetry}
          className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-black" />
          <span className="text-black font-semibold">Refresh Telemetry</span>
        </Button>
      </div>

      {/* Grid: Operator Info & Database Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operator Credentials Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Authorized Platform Operator</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                Hard-Locked Root Operator Email
              </span>
              <span className="font-mono text-sm text-white font-semibold">
                owusujunior2004@gmail.com
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                Active Session Operator
              </span>
              <span className="font-mono text-xs text-neutral-300">
                {activeEmail}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <span className="text-neutral-400">Security Access Level:</span>
              <Badge variant="default" className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono">
                TIER-1 FULL PRIVILEGE
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">Platform Isolation:</span>
              <span className="text-emerald-400 font-medium">Multi-Tenant Enforced</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">Database Driver:</span>
              <span className="font-mono text-neutral-300">
                {isLive ? 'Supabase PostgreSQL (Live Connected)' : 'Dexie IndexedDB (Offline-First)'}
              </span>
            </div>
          </div>
        </div>

        {/* Database & Storage Telemetry */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Live Storage Telemetry</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-[10px] uppercase text-neutral-500 block">Active Users</span>
              <span className="font-mono font-bold text-white text-base mt-0.5 block">
                {tableCounts.profiles ?? 0}
              </span>
              <span className="text-[10px] text-neutral-500">Verified Tailor Accounts</span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-[10px] uppercase text-neutral-500 block">Studio Workspaces</span>
              <span className="font-mono font-bold text-white text-base mt-0.5 block">
                {tableCounts.businesses ?? 0}
              </span>
              <span className="text-[10px] text-neutral-500">Registered Tenants</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/80 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Tailoring Clients:</span>
              <span className="font-mono text-white font-medium">{tableCounts.customers ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Orders Placed:</span>
              <span className="font-mono text-white font-medium">{tableCounts.orders ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Reconciled Payments:</span>
              <span className="font-mono text-white font-medium">{tableCounts.payments ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>IndexedDB Cache Usage:</span>
              <span className="font-mono text-neutral-300 font-medium">{storageEstimate.usage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Multi-Tenant SQL Policy Quick Copy */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Supabase Admin SQL &amp; Subscription Schema Sync</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySql}
              className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 h-8 shadow-sm"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span className="text-black font-semibold">{copiedSql ? 'Admin SQL Copied!' : 'Copy Admin Auth SQL'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySubscriptionSql}
              className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 h-8 shadow-sm"
            >
              {copiedSubSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span className="text-black font-semibold">{copiedSubSql ? 'Subscription SQL Copied!' : 'Copy Subscription Schema SQL'}</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Run these SQL migrations in your <span className="text-white font-mono">Supabase SQL Editor</span> to grant <span className="text-white font-mono">owusujunior2004@gmail.com</span> root visibility and create the <span className="text-white font-mono">platform_subscription_settings</span> and <span className="text-white font-mono">studio_subscription_overrides</span> tables.
        </p>
      </div>

      {/* Global Subscription Parameters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Live Platform Subscription Rules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Base Tier Fee</span>
            <div className="font-mono font-bold text-lg text-amber-400">GHS {subConfig.baseTierPriceGHS}.00 / mo</div>
            <p className="text-[11px] text-neutral-400">Standard studio usage with unlimited customer quota</p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Pro Tier Fee</span>
            <div className="font-mono font-bold text-lg text-emerald-400">GHS {subConfig.proTierPriceGHS}.00 / mo</div>
            <p className="text-[11px] text-neutral-400">Unlimited clients, photo storage, templates & staff</p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Free Trial Limit</span>
            <div className="font-mono font-bold text-lg text-white">{subConfig.freeCustomerLimit} Clients</div>
            <p className="text-[11px] text-neutral-400">{subConfig.freeTrialDays} days trial ({subConfig.trialType} mode)</p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Data Lock On Expiry</span>
            <div className={`font-mono font-bold text-lg ${subConfig.lockDataWhenExpired ? 'text-red-400' : 'text-emerald-400'}`}>
              {subConfig.lockDataWhenExpired ? 'Data Locked' : 'Data Visible'}
            </div>
            <p className="text-[11px] text-neutral-400">Controlled by platform admin</p>
          </div>
        </div>
      </div>

      {/* Platform Maintenance & Developer Data Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Server className="w-5 h-5 text-neutral-300" />
          <h2 className="text-sm font-bold text-white">Platform Operations & Backup</h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Administrative backup tools allow the platform operator to download a complete tamper-resistant JSON snapshot of all tenant workspaces or populate realistic sample studio data for testing.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullBackup}
            className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span className="text-black font-semibold">Export Full Platform Backup (JSON)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSeeding}
            onClick={handleSeedDemoData}
            className="bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700 border border-neutral-700 text-xs gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Seeding...' : 'Seed Sample Studio Data'}</span>
          </Button>
        </div>

        {seedSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sample tailoring studios, clients, orders, and payments seeded successfully!</span>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-neutral-500 pt-4">
        SewDesk Platform Engine &bull; Designed and built by <span className="text-neutral-300 font-semibold">Dev_OJ</span>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Business, Customer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Sliders,
  CreditCard,
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Save,
  Lock,
  Unlock,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  getSubscriptionConfig,
  saveSubscriptionConfig,
  setStudioSubscriptionOverride,
  clearStudioSubscriptionOverride,
  syncSubscriptionConfigWithSupabase,
  type PlatformSubscriptionConfig,
  type StudioOverride,
} from '@/features/subscriptions/services/subscriptionConfig';

interface StudioSubscription {
  business: Business;
  customerCount: number;
  tier: 'free_trial' | 'base' | 'pro' | 'expired';
  isNearLimit: boolean;
  isAtLimit: boolean;
  override?: StudioOverride;
}

interface OverrideModalState {
  businessId: string;
  businessName: string;
  current: StudioOverride;
}

const TIER_LABEL: Record<string, string> = {
  free_trial: 'FREE TRIAL',
  base: 'BASE',
  pro: 'PRO',
  expired: 'EXPIRED',
};

const TIER_CLASS: Record<string, string> = {
  free_trial: 'border-blue-700 text-blue-400 bg-blue-950/40',
  base: 'border-amber-700 text-amber-400 bg-amber-950/40',
  pro: 'border-emerald-700 text-emerald-400 bg-emerald-950/40',
  expired: 'border-red-700 text-red-400 bg-red-950/40',
};

export const PlatformSubscriptionsPage: React.FC = () => {
  const [studios, setStudios] = useState<StudioSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pro' | 'base' | 'free_trial' | 'expired'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [overrideModal, setOverrideModal] = useState<OverrideModalState | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Global config state
  const [config, setConfig] = useState<PlatformSubscriptionConfig>(getSubscriptionConfig());
  const [draftConfig, setDraftConfig] = useState<PlatformSubscriptionConfig>(getSubscriptionConfig());

  const isLive = isSupabaseConfigured();

  // Listen for config changes from other parts of the UI
  useEffect(() => {
    const handleChange = () => {
      const latest = getSubscriptionConfig();
      setConfig(latest);
      setDraftConfig(latest);
    };
    window.addEventListener('sewdesk_subscription_config_changed', handleChange);
    return () => window.removeEventListener('sewdesk_subscription_config_changed', handleChange);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isLive) {
        await syncSubscriptionConfigWithSupabase().catch(() => {});
      }

      let bizList: Business[] = [];
      let custList: Customer[] = [];

      if (isLive) {
        const [bizRes, custRes] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*'),
        ]);
        if (bizRes.data) bizList = bizRes.data as Business[];
        if (custRes.data) custList = custRes.data as Customer[];
      } else {
        const [bData, cData] = await Promise.all([
          db.businesses.toArray(),
          db.customers.toArray(),
        ]);
        bizList = bData;
        custList = cData;
      }

      const cfg = getSubscriptionConfig();

      const mapped: StudioSubscription[] = bizList.map((b) => {
        const matchingCustomers = custList.filter((c) => c.business_id === b.id);
        const count = Math.max(matchingCustomers.length, b.customer_slots_used || 0);
        const override = cfg.studioOverrides[b.id];
        const limit = override?.customCustomerLimit ?? cfg.freeCustomerLimit;

        let tier: 'free_trial' | 'base' | 'pro' | 'expired' = 'free_trial';
        if (override?.forceTier) {
          tier = override.forceTier;
        } else if (b.customer_slots_used > 100) {
          tier = 'pro';
        } else {
          const createdDate = new Date(b.created_at);
          const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const isQuotaExhausted = count >= limit;
          const isDaysExhausted = ageInDays >= cfg.freeTrialDays;
          const isTrialEnded =
            cfg.trialType === 'customer_quota'
              ? isQuotaExhausted
              : cfg.trialType === 'trial_days'
              ? isDaysExhausted
              : isQuotaExhausted || isDaysExhausted;
          tier = isTrialEnded ? 'expired' : 'free_trial';
        }

        return {
          business: b,
          customerCount: count,
          tier,
          isNearLimit: tier === 'free_trial' && count >= Math.floor(limit * 0.8),
          isAtLimit: tier === 'free_trial' && count >= limit,
          override,
        };
      });

      setStudios(mapped);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Aggregates
  const proCount = studios.filter((s) => s.tier === 'pro').length;
  const baseCount = studios.filter((s) => s.tier === 'base').length;
  const freeCount = studios.filter((s) => s.tier === 'free_trial').length;
  const expiredCount = studios.filter((s) => s.tier === 'expired').length;
  const nearLimitCount = studios.filter((s) => s.isNearLimit).length;
  const estimatedMRR =
    proCount * config.proTierPriceGHS + baseCount * config.baseTierPriceGHS;

  // Filtered
  const filteredStudios = useMemo(() => {
    return studios.filter((s) => {
      if (filterMode !== 'all' && s.tier !== filterMode) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.business.business_name?.toLowerCase().includes(q) ||
        s.business.contact_email?.toLowerCase().includes(q) ||
        s.business.city?.toLowerCase().includes(q)
      );
    });
  }, [studios, filterMode, searchTerm]);

  const handleForceTier = async (studio: StudioSubscription, tier: StudioOverride['forceTier']) => {
    setIsProcessing(studio.business.id);
    try {
      setStudioSubscriptionOverride(studio.business.id, { forceTier: tier });
      await loadSubscriptions();
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleDataLock = async (studio: StudioSubscription) => {
    setIsProcessing(studio.business.id + '_lock');
    try {
      const currentLock = studio.override?.customLockData ?? false;
      setStudioSubscriptionOverride(studio.business.id, { customLockData: !currentLock });
      await loadSubscriptions();
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      saveSubscriptionConfig(draftConfig);
      setConfig(draftConfig);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
      await loadSubscriptions();
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveOverride = (override: StudioOverride) => {
    if (!overrideModal) return;
    setStudioSubscriptionOverride(overrideModal.businessId, override);
    setOverrideModal(null);
    loadSubscriptions();
  };

  const handleClearOverride = (businessId: string) => {
    clearStudioSubscriptionOverride(businessId);
    loadSubscriptions();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Subscriptions
            </h1>
            <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs font-mono">
              Admin Control Panel
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure subscription tiers, trial limits, pricing, and per-studio overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigPanelOpen((o) => !o)}
            className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Config</span>
            {configPanelOpen ? (
              <ChevronUp className="w-3 h-3 text-black" />
            ) : (
              <ChevronDown className="w-3 h-3 text-black" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubscriptions}
            disabled={isLoading}
            className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-black">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      {configPanelOpen && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-400" />
              Global Subscription Configuration
            </h2>
            {configSaved && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trial Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Trial Type
              </label>
              <select
                value={draftConfig.trialType}
                onChange={(e) =>
                  setDraftConfig((d) => ({ ...d, trialType: e.target.value as PlatformSubscriptionConfig['trialType'] }))
                }
                className="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-500"
              >
                <option value="both">Both (quota + days)</option>
                <option value="customer_quota">Customer Quota Only</option>
                <option value="trial_days">Days Only</option>
              </select>
              <p className="text-[10px] text-neutral-500">When either condition is hit, trial ends.</p>
            </div>

            {/* Free Customer Limit */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Free Customer Limit
              </label>
              <Input
                type="number"
                min={1}
                max={500}
                value={draftConfig.freeCustomerLimit}
                onChange={(e) =>
                  setDraftConfig((d) => ({ ...d, freeCustomerLimit: Number(e.target.value) }))
                }
                className="h-9 bg-neutral-800 border-neutral-700 text-white text-xs"
              />
              <p className="text-[10px] text-neutral-500">Max customers before trial expires (default 15).</p>
            </div>

            {/* Free Trial Days */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Free Trial Days
              </label>
              <Input
                type="number"
                min={0}
                max={365}
                value={draftConfig.freeTrialDays}
                onChange={(e) =>
                  setDraftConfig((d) => ({ ...d, freeTrialDays: Number(e.target.value) }))
                }
                className="h-9 bg-neutral-800 border-neutral-700 text-white text-xs"
              />
              <p className="text-[10px] text-neutral-500">Days from workspace creation before trial expires.</p>
            </div>

            {/* Base Tier Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Base Tier Price (GHS/mo)
              </label>
              <Input
                type="number"
                min={0}
                value={draftConfig.baseTierPriceGHS}
                onChange={(e) =>
                  setDraftConfig((d) => ({ ...d, baseTierPriceGHS: Number(e.target.value) }))
                }
                className="h-9 bg-neutral-800 border-neutral-700 text-white text-xs"
              />
              <p className="text-[10px] text-neutral-500">Monthly fee for the Base Workspace tier.</p>
            </div>

            {/* Pro Tier Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Pro Tier Price (GHS/mo)
              </label>
              <Input
                type="number"
                min={0}
                value={draftConfig.proTierPriceGHS}
                onChange={(e) =>
                  setDraftConfig((d) => ({ ...d, proTierPriceGHS: Number(e.target.value) }))
                }
                className="h-9 bg-neutral-800 border-neutral-700 text-white text-xs"
              />
              <p className="text-[10px] text-neutral-500">Monthly fee for the Pro Atelier tier.</p>
            </div>

            {/* Data Lock Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                Lock Data on Expiry
              </label>
              <button
                type="button"
                onClick={() =>
                  setDraftConfig((d) => ({ ...d, lockDataWhenExpired: !d.lockDataWhenExpired }))
                }
                className={`w-full h-9 flex items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-all ${
                  draftConfig.lockDataWhenExpired
                    ? 'bg-red-950 border-red-700 text-red-400'
                    : 'bg-emerald-950 border-emerald-700 text-emerald-400'
                }`}
              >
                {draftConfig.lockDataWhenExpired ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Data Locked on Expiry
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    Data Visible on Expiry
                  </>
                )}
              </button>
              <p className="text-[10px] text-neutral-500">
                When ON, expired studios cannot view their stored data.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDraftConfig(config)}
              className="bg-transparent text-neutral-400 hover:text-white border-neutral-700 text-xs gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="bg-white text-black font-bold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-black" />
              <span className="text-black">{savingConfig ? 'Saving…' : 'Save Configuration'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Est. MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-bold text-emerald-400">
            {formatCurrency(estimatedMRR, 'GHS')}
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">Base + Pro subscriptions</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Pro Studios</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-bold text-white">{proCount}</div>
          <p className="text-[10px] text-neutral-500 mt-1">Unlimited capacity</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Base Tier</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-bold text-amber-400">{baseCount}</div>
          <p className="text-[10px] text-neutral-500 mt-1">GHS {config.baseTierPriceGHS}/mo</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Free / Expired</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-bold text-white">
            <span className="text-blue-400">{freeCount}</span>
            <span className="text-neutral-600 mx-1">/</span>
            <span className="text-red-400">{expiredCount}</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">{nearLimitCount} near limit</p>
        </div>
      </div>

      {/* Config summary pills */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] text-neutral-300">
          <Clock className="w-3 h-3 text-blue-400" />
          Trial: {config.freeTrialDays} days
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] text-neutral-300">
          <UserCheck className="w-3 h-3 text-amber-400" />
          Free limit: {config.freeCustomerLimit} customers
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-[11px] text-neutral-300">
          <CreditCard className="w-3 h-3 text-emerald-400" />
          Base: GHS {config.baseTierPriceGHS}/mo · Pro: GHS {config.proTierPriceGHS}/mo
        </span>
        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${
            config.lockDataWhenExpired
              ? 'bg-red-950/60 border-red-800 text-red-400'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
          }`}
        >
          {config.lockDataWhenExpired ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {config.lockDataWhenExpired ? 'Data locks on expiry' : 'Data visible on expiry'}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by studio name, email, or city…"
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {(['all', 'free_trial', 'base', 'pro', 'expired'] as const).map((mode) => {
            const count =
              mode === 'all'
                ? studios.length
                : studios.filter((s) => s.tier === mode).length;
            const labels: Record<string, string> = {
              all: 'All',
              free_trial: 'Trial',
              base: 'Base',
              pro: 'Pro',
              expired: 'Expired',
            };
            const activeClass: Record<string, string> = {
              all: 'bg-neutral-800 text-white shadow-sm',
              free_trial: 'bg-blue-950 text-blue-400 border border-blue-800',
              base: 'bg-amber-950 text-amber-400 border border-amber-800',
              pro: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
              expired: 'bg-red-950 text-red-400 border border-red-800',
            };
            return (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterMode === mode ? activeClass[mode] : 'text-neutral-400 hover:text-white'
                }`}
              >
                {labels[mode]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Studio List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {filteredStudios.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-neutral-700" />
            <p>No studio subscriptions matching criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {filteredStudios.map((s) => {
              const cfg = getSubscriptionConfig();
              const limit = s.override?.customCustomerLimit ?? cfg.freeCustomerLimit;
              const percent =
                s.tier === 'pro'
                  ? 100
                  : Math.min(100, (s.customerCount / Math.max(1, limit)) * 100);
              const isWorking = isProcessing === s.business.id || isProcessing === s.business.id + '_lock';
              const isDataLocked =
                s.override?.customLockData ?? (s.tier === 'expired' && cfg.lockDataWhenExpired);

              return (
                <div
                  key={s.business.id}
                  className="p-4 sm:p-5 hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    {/* Studio Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">
                            {s.business.business_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono shrink-0 ${TIER_CLASS[s.tier] || 'border-neutral-700 text-neutral-400'}`}
                          >
                            {TIER_LABEL[s.tier]}
                          </Badge>
                          {isDataLocked && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono border-red-700 text-red-400 bg-red-950/40 shrink-0"
                            >
                              <Lock className="w-2.5 h-2.5 mr-0.5" />
                              DATA LOCKED
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 font-mono truncate">
                          {s.business.contact_email || 'No email'} &bull;{' '}
                          {s.business.city || 'Accra'}, {s.business.country || 'Ghana'}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          Created {formatDate(s.business.created_at)}
                          {s.override && (
                            <span className="ml-1.5 text-amber-400 font-semibold">• Override Active</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 text-[11px]">Customer Usage:</span>
                        <span className="font-mono text-white text-xs">
                          {s.tier === 'pro'
                            ? `${s.customerCount} (Unlimited)`
                            : `${s.customerCount} / ${limit}`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            s.tier === 'pro'
                              ? 'bg-emerald-500'
                              : s.tier === 'base'
                              ? 'bg-amber-500'
                              : s.isAtLimit
                              ? 'bg-red-500'
                              : s.isNearLimit
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        disabled={isWorking}
                        value={s.override?.forceTier || ''}
                        onChange={(e) =>
                          handleForceTier(
                            s,
                            (e.target.value as StudioOverride['forceTier']) || undefined
                          )
                        }
                        className="h-8 px-2 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-500 disabled:opacity-50"
                      >
                        <option value="">Auto Tier</option>
                        <option value="free_trial">Force: Free Trial</option>
                        <option value="base">Force: Base</option>
                        <option value="pro">Force: Pro</option>
                        <option value="expired">Force: Expired</option>
                      </select>

                      <button
                        disabled={isWorking}
                        onClick={() => handleToggleDataLock(s)}
                        className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                          isDataLocked
                            ? 'bg-red-950 border-red-700 text-red-400 hover:bg-red-900'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {isDataLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isDataLocked ? 'Locked' : 'Unlocked'}
                      </button>

                      <button
                        onClick={() =>
                          setOverrideModal({
                            businessId: s.business.id,
                            businessName: s.business.business_name,
                            current: s.override || {},
                          })
                        }
                        className="h-8 px-3 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Override
                      </button>

                      {s.override && (
                        <button
                          onClick={() => handleClearOverride(s.business.id)}
                          className="h-8 px-3 rounded-lg border border-red-800 bg-red-950/40 text-red-400 hover:bg-red-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Override Modal */}
      {overrideModal && (
        <OverrideModal
          businessName={overrideModal.businessName}
          current={overrideModal.current}
          onSave={handleSaveOverride}
          onClose={() => setOverrideModal(null)}
        />
      )}
    </div>
  );
};

// ─── Override Modal ───────────────────────────────────────────────────────────

interface OverrideModalProps {
  businessName: string;
  current: StudioOverride;
  onSave: (override: StudioOverride) => void;
  onClose: () => void;
}

const OverrideModal: React.FC<OverrideModalProps> = ({ businessName, current, onSave, onClose }) => {
  const [draft, setDraft] = useState<StudioOverride>({ ...current });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-neutral-900 border border-neutral-700 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Studio Override</h3>
            <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs">{businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              Custom Customer Limit
            </label>
            <Input
              type="number"
              min={1}
              placeholder="Leave empty to use global default"
              value={draft.customCustomerLimit ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  customCustomerLimit: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="h-9 bg-neutral-800 border-neutral-700 text-white text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              Force Tier
            </label>
            <select
              value={draft.forceTier || ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  forceTier: (e.target.value as StudioOverride['forceTier']) || undefined,
                }))
              }
              className="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-500"
            >
              <option value="">Auto (computed)</option>
              <option value="free_trial">Free Trial</option>
              <option value="base">Base Workspace</option>
              <option value="pro">Pro Atelier</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              Data Lock Override
            </label>
            <div className="flex gap-2">
              {[
                { label: 'Follow Global', value: undefined },
                { label: 'Force Lock', value: true },
                { label: 'Force Unlock', value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, customLockData: opt.value }))}
                  className={`flex-1 h-9 rounded-lg border text-xs font-semibold transition-all ${
                    draft.customLockData === opt.value
                      ? opt.value === true
                        ? 'bg-red-950 border-red-700 text-red-400'
                        : opt.value === false
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                        : 'bg-neutral-700 border-neutral-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              Grace Period Until
            </label>
            <input
              type="date"
              value={draft.gracePeriodUntil?.slice(0, 10) || ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  gracePeriodUntil: e.target.value ? e.target.value + 'T23:59:59Z' : undefined,
                }))
              }
              className="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-500"
            />
            <p className="text-[10px] text-neutral-500">Studio keeps access until this date even if expired.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              Admin Notes
            </label>
            <textarea
              rows={3}
              placeholder="Internal notes for this studio…"
              value={draft.notes || ''}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value || undefined }))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 bg-transparent border-neutral-700 text-neutral-400 hover:text-white text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(draft)}
            className="flex-1 bg-white text-black font-bold hover:bg-neutral-100 border border-neutral-300 text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-black" />
            <span className="text-black">Save Override</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

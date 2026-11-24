import { useState, useEffect } from 'react';
import type { Business, Subscription } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export type TrialType = 'customer_quota' | 'trial_days' | 'both';

export interface StudioOverride {
  customCustomerLimit?: number;
  customLockData?: boolean; // explicit toggle to lock or unlock data view
  forceTier?: 'free_trial' | 'base' | 'pro' | 'expired';
  gracePeriodUntil?: string;
  notes?: string;
}

export const DEFAULT_BASE_FEATURES = [
  'Unlimited registered customer profiles',
  'Interactive measurement ruler & body dimensions',
  'Workshop orders & production pipeline tracking',
  'Up to 3 invited staff / tailor accounts',
  'Offline-aware Dexie database & cloud backup',
  'Customer history & records preserved',
];

export const DEFAULT_PRO_FEATURES = [
  'Everything in Base Workspace tier',
  'Unlimited custom measurement templates',
  'Unlimited invited staff & team accounts',
  'Fabric swatch & client posture photo vault',
  'Automated WhatsApp fitting notices & dispatch',
  'Piece-rate tailor commission payroll tracking',
  'Digital measurement cards & printable QR slips',
  'Advanced workshop revenue & ledger exports',
  'Multi-device real-time cloud synchronization',
];

export interface PlatformSubscriptionConfig {
  trialType: TrialType;
  freeCustomerLimit: number; // default e.g. 15, fully editable by admin
  freeTrialDays: number; // e.g. 14 days, fully editable by admin
  baseTierPriceGHS: number; // 50 GHS per month
  proTierPriceGHS: number; // 150 GHS per month
  lockDataWhenExpired: boolean; // platform admin toggle: block stored data viewing when expired
  trialDescription?: string;
  baseDescription?: string;
  proDescription?: string;
  baseFeatures?: string[];
  proFeatures?: string[];
  studioOverrides: Record<string, StudioOverride>;
  updatedAt: string;
}

const STORAGE_KEY = 'sewdesk_platform_subscription_config';

export const DEFAULT_SUBSCRIPTION_CONFIG: PlatformSubscriptionConfig = {
  trialType: 'both',
  freeCustomerLimit: 15, // editable customer threshold
  freeTrialDays: 14,
  baseTierPriceGHS: 50, // 50 cedis per month standard usage
  proTierPriceGHS: 150, // 150 cedis per month pro features
  lockDataWhenExpired: true, // admin toggle to block stored data view upon expiry
  trialDescription: 'Essential digital tailoring workspace with trial capacity.',
  baseDescription: 'Full studio workflow with unlimited customer records.',
  proDescription: 'Unlimited clients, photo vault, WhatsApp dispatch, custom templates, and team seats.',
  baseFeatures: DEFAULT_BASE_FEATURES,
  proFeatures: DEFAULT_PRO_FEATURES,
  studioOverrides: {},
  updatedAt: new Date().toISOString(),
};

/**
 * Returns the current platform subscription configuration from local cache.
 */
export const getSubscriptionConfig = (): PlatformSubscriptionConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUBSCRIPTION_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SUBSCRIPTION_CONFIG,
      ...parsed,
      baseFeatures: parsed.baseFeatures || DEFAULT_BASE_FEATURES,
      proFeatures: parsed.proFeatures || DEFAULT_PRO_FEATURES,
      studioOverrides: parsed.studioOverrides || {},
    };
  } catch {
    return DEFAULT_SUBSCRIPTION_CONFIG;
  }
};

/**
 * Saves platform subscription configuration locally and syncs to Supabase.
 */
export const saveSubscriptionConfig = (
  config: PlatformSubscriptionConfig
): PlatformSubscriptionConfig => {
  const updated = {
    ...config,
    baseFeatures: config.baseFeatures || DEFAULT_BASE_FEATURES,
    proFeatures: config.proFeatures || DEFAULT_PRO_FEATURES,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactive sync across open views
    window.dispatchEvent(new CustomEvent('sewdesk_subscription_config_changed', { detail: updated }));
  } catch (err) {
    console.error('Error saving subscription config to localStorage:', err);
  }

  // Push to Supabase database if connected
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        const { error } = await supabase
          .from('platform_subscription_settings')
          .upsert(
            {
              id: 'global',
              trial_type: updated.trialType,
              free_customer_limit: updated.freeCustomerLimit,
              free_trial_days: updated.freeTrialDays,
              base_tier_price_ghs: updated.baseTierPriceGHS,
              pro_tier_price_ghs: updated.proTierPriceGHS,
              lock_data_when_expired: updated.lockDataWhenExpired,
              updated_at: updated.updatedAt,
            },
            { onConflict: 'id' }
          );
        if (error) {
          console.warn('Could not sync subscription settings to Supabase (table may need migration):', error.message);
        }
      } catch (err) {
        console.warn('Network error syncing subscription settings to Supabase:', err);
      }
    })();
  }

  return updated;
};

export const updateSubscriptionConfig = (
  partial: Partial<PlatformSubscriptionConfig>
): PlatformSubscriptionConfig => {
  const current = getSubscriptionConfig();
  return saveSubscriptionConfig({
    ...current,
    ...partial,
  });
};

/**
 * Sets an override for a specific studio workspace and syncs to Supabase.
 */
export const setStudioSubscriptionOverride = (
  businessId: string,
  override: Partial<StudioOverride>
): PlatformSubscriptionConfig => {
  const current = getSubscriptionConfig();
  const existing = current.studioOverrides[businessId] || {};
  const mergedOverride = {
    ...existing,
    ...override,
  };
  const updatedOverrides = {
    ...current.studioOverrides,
    [businessId]: mergedOverride,
  };

  // Sync override to Supabase
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        const { error } = await supabase
          .from('studio_subscription_overrides')
          .upsert(
            {
              business_id: businessId,
              custom_customer_limit: mergedOverride.customCustomerLimit ?? null,
              custom_lock_data: mergedOverride.customLockData ?? null,
              force_tier: mergedOverride.forceTier ?? null,
              grace_period_until: mergedOverride.gracePeriodUntil ?? null,
              notes: mergedOverride.notes ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'business_id' }
          );
        if (error) {
          console.warn('Could not sync studio override to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Network error syncing studio override to Supabase:', err);
      }
    })();
  }

  return saveSubscriptionConfig({
    ...current,
    studioOverrides: updatedOverrides,
  });
};

/**
 * Clears an override for a specific studio workspace and syncs to Supabase.
 */
export const clearStudioSubscriptionOverride = (
  businessId: string
): PlatformSubscriptionConfig => {
  const current = getSubscriptionConfig();
  const updatedOverrides = { ...current.studioOverrides };
  delete updatedOverrides[businessId];

  // Sync deletion to Supabase
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        const { error } = await supabase
          .from('studio_subscription_overrides')
          .delete()
          .eq('business_id', businessId);
        if (error) {
          console.warn('Could not delete studio override from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Network error deleting studio override from Supabase:', err);
      }
    })();
  }

  return saveSubscriptionConfig({
    ...current,
    studioOverrides: updatedOverrides,
  });
};

/**
 * Fetches subscription settings and studio overrides from Supabase and hydrates local storage.
 */
export const syncSubscriptionConfigWithSupabase = async (): Promise<PlatformSubscriptionConfig> => {
  if (!isSupabaseConfigured()) {
    return getSubscriptionConfig();
  }

  try {
    // 1. Fetch global platform settings
    const { data: settingsData, error: settingsErr } = await supabase
      .from('platform_subscription_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    // 2. Fetch studio overrides
    const { data: overridesData, error: overridesErr } = await supabase
      .from('studio_subscription_overrides')
      .select('*');

    const current = getSubscriptionConfig();
    let updated = { ...current };

    if (!settingsErr && settingsData) {
      updated = {
        ...updated,
        trialType: (settingsData.trial_type as TrialType) || updated.trialType,
        freeCustomerLimit: settingsData.free_customer_limit ?? updated.freeCustomerLimit,
        freeTrialDays: settingsData.free_trial_days ?? updated.freeTrialDays,
        baseTierPriceGHS: Number(settingsData.base_tier_price_ghs ?? updated.baseTierPriceGHS),
        proTierPriceGHS: Number(settingsData.pro_tier_price_ghs ?? updated.proTierPriceGHS),
        lockDataWhenExpired: settingsData.lock_data_when_expired ?? updated.lockDataWhenExpired,
        updatedAt: settingsData.updated_at || updated.updatedAt,
      };
    }

    if (!overridesErr && overridesData && Array.isArray(overridesData)) {
      const overridesMap: Record<string, StudioOverride> = {};
      overridesData.forEach((row: any) => {
        overridesMap[row.business_id] = {
          customCustomerLimit: row.custom_customer_limit ?? undefined,
          customLockData: row.custom_lock_data ?? undefined,
          forceTier: row.force_tier ?? undefined,
          gracePeriodUntil: row.grace_period_until ?? undefined,
          notes: row.notes ?? undefined,
        };
      });
      updated.studioOverrides = overridesMap;
    }

    // Update local cache & dispatch reactive event
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sewdesk_subscription_config_changed', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to sync subscription config with Supabase:', err);
    return getSubscriptionConfig();
  }
};

// Initial background sync on module load if connected
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  syncSubscriptionConfigWithSupabase().catch(() => {});
}

export interface StudioAccessState {
  tier: 'free_trial' | 'base' | 'pro' | 'expired';
  tierName: string;
  isDataLocked: boolean;
  isAtCustomerLimit: boolean;
  isNearCustomerLimit: boolean;
  slotsUsed: number;
  maxSlots: number;
  trialDaysLeft: number | null;
  freeTrialDays: number;
  expiresAt: string | null;
  basePrice: number;
  proPrice: number;
  canCreateCustomer: boolean;
  hasActiveSubscription: boolean;
  isPro: boolean;
  isBase: boolean;
  trialType: TrialType;
  lockDataWhenExpired: boolean;
  trialDescription: string;
  baseDescription: string;
  proDescription: string;
  baseFeatures: string[];
  proFeatures: string[];
}

export const evaluateStudioAccess = (
  business: Business | null,
  subscription?: Subscription | null
): StudioAccessState => {
  const config = getSubscriptionConfig();

  const trialDesc = config.trialDescription || DEFAULT_SUBSCRIPTION_CONFIG.trialDescription!;
  const baseDesc = config.baseDescription || DEFAULT_SUBSCRIPTION_CONFIG.baseDescription!;
  const proDesc = config.proDescription || DEFAULT_SUBSCRIPTION_CONFIG.proDescription!;
  const baseFeats = config.baseFeatures && config.baseFeatures.length > 0 ? config.baseFeatures : DEFAULT_BASE_FEATURES;
  const proFeats = config.proFeatures && config.proFeatures.length > 0 ? config.proFeatures : DEFAULT_PRO_FEATURES;

  if (!business) {
    return {
      tier: 'free_trial',
      tierName: 'Free Trial',
      isDataLocked: false,
      isAtCustomerLimit: false,
      isNearCustomerLimit: false,
      slotsUsed: 0,
      maxSlots: config.freeCustomerLimit,
      trialDaysLeft: config.freeTrialDays,
      freeTrialDays: config.freeTrialDays,
      expiresAt: null,
      basePrice: config.baseTierPriceGHS,
      proPrice: config.proTierPriceGHS,
      canCreateCustomer: true,
      hasActiveSubscription: false,
      isPro: false,
      isBase: false,
      trialType: config.trialType,
      lockDataWhenExpired: config.lockDataWhenExpired,
      trialDescription: trialDesc,
      baseDescription: baseDesc,
      proDescription: proDesc,
      baseFeatures: baseFeats,
      proFeatures: proFeats,
    };
  }

  const override = config.studioOverrides[business.id] || {};
  const maxSlots = override.customCustomerLimit ?? config.freeCustomerLimit;
  const slotsUsed = business.customer_slots_used || 0;

  // Determine active plan tier
  let tier: 'free_trial' | 'base' | 'pro' | 'expired' = 'free_trial';
  let expiresAt: string | null = null;

  if (override.forceTier) {
    tier = override.forceTier;
  } else if (subscription && subscription.status === 'active') {
    tier = subscription.plan_id === 'base_studio' ? 'base' : 'pro';
    expiresAt = subscription.expires_at || null;
  } else if (business.customer_slots_used > 100) {
    tier = 'pro';
  } else {
    // Check trial expiration
    const createdDate = new Date(business.created_at);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, config.freeTrialDays - ageInDays);

    const isQuotaExhausted = slotsUsed >= maxSlots;
    const isDaysExhausted = daysLeft <= 0;

    let isTrialEnded = false;
    if (config.trialType === 'customer_quota') {
      isTrialEnded = isQuotaExhausted;
    } else if (config.trialType === 'trial_days') {
      isTrialEnded = isDaysExhausted;
    } else {
      isTrialEnded = isQuotaExhausted || isDaysExhausted;
    }

    // Grace period check: if admin granted grace period in the future, don't mark as expired
    if (override.gracePeriodUntil && new Date(override.gracePeriodUntil).getTime() > Date.now()) {
      isTrialEnded = false;
    }

    if (isTrialEnded) {
      tier = 'expired';
    } else {
      tier = 'free_trial';
    }
  }

  // Check data lock status
  let isDataLocked = false;
  if (override.customLockData !== undefined) {
    // Platform admin explicitly toggled lock for this studio
    isDataLocked = override.customLockData;
  } else if (tier === 'expired' && config.lockDataWhenExpired) {
    // Global data lock is active and studio is expired
    isDataLocked = true;
  }

  const isNearLimit = tier === 'free_trial' && slotsUsed >= Math.floor(maxSlots * 0.8);
  const isAtCustomerLimit = tier === 'free_trial' && slotsUsed >= maxSlots;
  const canCreateCustomer = (tier === 'base' || tier === 'pro') || (!isAtCustomerLimit && tier === 'free_trial');

  const createdDate = new Date(business.created_at);
  const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const trialDaysLeft = Math.max(0, config.freeTrialDays - ageInDays);

  return {
    tier,
    tierName:
      tier === 'pro'
        ? 'Pro Atelier'
        : tier === 'base'
        ? 'Base Workspace'
        : tier === 'free_trial'
        ? 'Free Trial'
        : 'Subscription Expired',
    isDataLocked,
    isAtCustomerLimit,
    isNearCustomerLimit: isNearLimit,
    slotsUsed,
    maxSlots,
    trialDaysLeft: tier === 'free_trial' ? trialDaysLeft : null,
    freeTrialDays: config.freeTrialDays,
    expiresAt,
    basePrice: config.baseTierPriceGHS,
    proPrice: config.proTierPriceGHS,
    canCreateCustomer,
    hasActiveSubscription: tier === 'base' || tier === 'pro',
    isPro: tier === 'pro',
    isBase: tier === 'base',
    trialType: config.trialType,
    lockDataWhenExpired: config.lockDataWhenExpired,
    trialDescription: trialDesc,
    baseDescription: baseDesc,
    proDescription: proDesc,
    baseFeatures: baseFeats,
    proFeatures: proFeats,
  };
};

/**
 * React hook to reactively subscribe to live platform subscription config changes.
 */
export const useSubscriptionConfig = (): PlatformSubscriptionConfig => {
  const [config, setConfig] = useState<PlatformSubscriptionConfig>(getSubscriptionConfig);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<PlatformSubscriptionConfig>).detail;
      if (detail) {
        setConfig(detail);
      } else {
        setConfig(getSubscriptionConfig());
      }
    };

    window.addEventListener('sewdesk_subscription_config_changed', handleUpdate);
    return () => {
      window.removeEventListener('sewdesk_subscription_config_changed', handleUpdate);
    };
  }, []);

  return config;
};

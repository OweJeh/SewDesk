import type { Business, Subscription } from '@/types';

export type TrialType = 'customer_quota' | 'trial_days' | 'both';

export interface StudioOverride {
  customCustomerLimit?: number;
  customLockData?: boolean; // explicit toggle to lock or unlock data view
  forceTier?: 'free_trial' | 'base' | 'pro' | 'expired';
  gracePeriodUntil?: string;
  notes?: string;
}

export interface PlatformSubscriptionConfig {
  trialType: TrialType;
  freeCustomerLimit: number; // default e.g. 15 or 100, fully editable
  freeTrialDays: number; // e.g. 14 days
  baseTierPriceGHS: number; // 50 GHS per month
  proTierPriceGHS: number; // 150 GHS per month
  lockDataWhenExpired: boolean; // platform admin toggle: block stored data viewing when expired
  studioOverrides: Record<string, StudioOverride>;
  updatedAt: string;
}

const STORAGE_KEY = 'sewdesk_platform_subscription_config';

export const DEFAULT_SUBSCRIPTION_CONFIG: PlatformSubscriptionConfig = {
  trialType: 'both',
  freeCustomerLimit: 15, // editable customer threshold (e.g. 15 as requested)
  freeTrialDays: 14,
  baseTierPriceGHS: 50, // 50 cedis per month standard usage
  proTierPriceGHS: 150, // 150 cedis per month pro features
  lockDataWhenExpired: true, // admin toggle to block stored data view upon expiry
  studioOverrides: {},
  updatedAt: new Date().toISOString(),
};

export const getSubscriptionConfig = (): PlatformSubscriptionConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUBSCRIPTION_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SUBSCRIPTION_CONFIG,
      ...parsed,
      studioOverrides: parsed.studioOverrides || {},
    };
  } catch {
    return DEFAULT_SUBSCRIPTION_CONFIG;
  }
};

export const saveSubscriptionConfig = (
  config: PlatformSubscriptionConfig
): PlatformSubscriptionConfig => {
  const updated = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactive sync across open views
    window.dispatchEvent(new CustomEvent('sewdesk_subscription_config_changed', { detail: updated }));
  } catch (err) {
    console.error('Error saving subscription config:', err);
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

export const setStudioSubscriptionOverride = (
  businessId: string,
  override: Partial<StudioOverride>
): PlatformSubscriptionConfig => {
  const current = getSubscriptionConfig();
  const existing = current.studioOverrides[businessId] || {};
  const updatedOverrides = {
    ...current.studioOverrides,
    [businessId]: {
      ...existing,
      ...override,
    },
  };
  return saveSubscriptionConfig({
    ...current,
    studioOverrides: updatedOverrides,
  });
};

export const clearStudioSubscriptionOverride = (
  businessId: string
): PlatformSubscriptionConfig => {
  const current = getSubscriptionConfig();
  const updatedOverrides = { ...current.studioOverrides };
  delete updatedOverrides[businessId];
  return saveSubscriptionConfig({
    ...current,
    studioOverrides: updatedOverrides,
  });
};

export interface StudioAccessState {
  tier: 'free_trial' | 'base' | 'pro' | 'expired';
  tierName: string;
  isDataLocked: boolean;
  isAtCustomerLimit: boolean;
  isNearCustomerLimit: boolean;
  slotsUsed: number;
  maxSlots: number;
  trialDaysLeft: number | null;
  expiresAt: string | null;
  basePrice: number;
  proPrice: number;
  canCreateCustomer: boolean;
  hasActiveSubscription: boolean;
  isPro: boolean;
  isBase: boolean;
  trialType: TrialType;
}

export const evaluateStudioAccess = (
  business: Business | null,
  subscription?: Subscription | null
): StudioAccessState => {
  const config = getSubscriptionConfig();

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
      expiresAt: null,
      basePrice: config.baseTierPriceGHS,
      proPrice: config.proTierPriceGHS,
      canCreateCustomer: true,
      hasActiveSubscription: false,
      isPro: false,
      isBase: false,
      trialType: config.trialType,
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
    expiresAt,
    basePrice: config.baseTierPriceGHS,
    proPrice: config.proTierPriceGHS,
    canCreateCustomer,
    hasActiveSubscription: tier === 'base' || tier === 'pro',
    isPro: tier === 'pro',
    isBase: tier === 'base',
    trialType: config.trialType,
  };
};


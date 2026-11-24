import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { SubscriptionPlanCards } from '@/features/subscriptions/components/SubscriptionPlanCards';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  FileCheck2,
  Smartphone,
  ArrowRight,
  RefreshCw,
  Users,
  Lock,
  Clock,
  Zap,
  Star,
  HelpCircle,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const {
    currentBusiness,
    accessState,
    activateBaseTier,
    activateProTier,
    cancelSubscription,
  } = useCurrentBusiness();

  const [upgradeTarget, setUpgradeTarget] = useState<'base' | 'pro' | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'telecel' | 'card'>('mtn');
  const [phoneOrCard, setPhoneOrCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { tier, tierName, slotsUsed, maxSlots, trialDaysLeft, isDataLocked, canCreateCustomer, basePrice, proPrice } = accessState;

  const isExpired = tier === 'expired';
  const isFreeTrial = tier === 'free_trial';
  const isBase = tier === 'base';
  const isPro = tier === 'pro';
  const isNearLimit = accessState.isNearCustomerLimit;
  const isAtLimit = accessState.isAtCustomerLimit;

  const handleUpgrade = async () => {
    if (!upgradeTarget) return;
    setIsProcessing(true);
    const { error } =
      upgradeTarget === 'base' ? await activateBaseTier() : await activateProTier();
    setIsProcessing(false);

    if (!error) {
      setUpgradeTarget(null);
      const name = upgradeTarget === 'base' ? 'Base Workspace' : 'Pro Atelier';
      setSuccessMsg(`Congratulations! ${currentBusiness?.business_name} is now on the ${name} plan.`);
      setTimeout(() => setSuccessMsg(null), 6000);
    }
  };

  const handleCancel = async () => {
    if (
      confirm(
        'Revert to Free Trial? Your existing customer records, measurements, and orders will remain intact. Future actions will follow trial limits.'
      )
    ) {
      setIsProcessing(true);
      await cancelSubscription();
      setIsProcessing(false);
      setSuccessMsg('Your plan has been cancelled. All historical data remains preserved.');
      setTimeout(() => setSuccessMsg(null), 6000);
    }
  };

  const tierBadgeClass: Record<string, string> = {
    free_trial: 'bg-blue-50 border-blue-200 text-blue-700',
    base: 'bg-amber-50 border-amber-200 text-amber-700',
    pro: 'bg-black border-black text-white',
    expired: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-black">
                Subscription & Studio Tier
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tierBadgeClass[tier] || 'bg-neutral-50 border-neutral-200 text-neutral-600'}`}
              >
                {tierName}
              </span>
            </div>
            <p className="text-xs text-[#777777] mt-1">
              Manage your workshop capacity, subscription, and data access for{' '}
              <strong>{currentBusiness?.business_name}</strong>.
            </p>
          </div>

          {!isPro && !isBase && (
            <Button
              size="sm"
              onClick={() => setUpgradeTarget('base')}
              className="bg-black text-white hover:bg-neutral-800 self-start shrink-0 text-xs gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DATA LOCKED BANNER */}
      {isDataLocked && (
        <div className="p-5 bg-red-50 border-2 border-red-300 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Data Access Locked</p>
              <p className="text-xs text-red-500 mt-0.5">
                Your workspace subscription has expired. Renew to restore full data access.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setUpgradeTarget('base')}
            className="bg-red-600 text-white hover:bg-red-700 text-xs gap-1.5 w-full sm:w-auto"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Renew Now — GH₵ {basePrice}/mo
          </Button>
        </div>
      )}

      {/* TRIAL EXPIRED BANNER (not data-locked) */}
      {isExpired && !isDataLocked && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700">Free Trial Ended</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You've reached your trial limit. Subscribe to continue adding customers and accessing all features.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setUpgradeTarget('base')}
            className="bg-amber-600 text-white hover:bg-amber-700 text-xs gap-1.5 w-full sm:w-auto"
          >
            <Zap className="w-3.5 h-3.5" />
            Start Base Plan — GH₵ {basePrice}/mo
          </Button>
        </div>
      )}

      {/* Customer Usage Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Client Records & Usage</h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-black">{slotsUsed}</span>
            <span className="text-sm font-mono text-neutral-400">
              {isPro ? ' (Unlimited)' : isBase ? ' (Unlimited)' : ` / ${maxSlots} trial`}
            </span>
          </div>
        </div>

        {/* Progress bar — only for trial */}
        {!isPro && !isBase && (
          <>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-[#E5E5E5]">
              <div
                className={`h-full transition-all duration-500 ${
                  isExpired ? 'bg-red-500' : isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-black'
                }`}
                style={{ width: `${Math.min(100, (slotsUsed / Math.max(1, maxSlots)) * 100)}%` }}
              />
            </div>

            {isFreeTrial && trialDaysLeft !== null && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} trial day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                    : 'Trial period has ended'}
                </span>
              </div>
            )}

            {!canCreateCustomer && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Customer creation is paused — subscribe to continue.
              </p>
            )}
          </>
        )}

        {(isPro || isBase) && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            Unlimited customer records — no cap applied.
          </div>
        )}
      </div>

      {/* Plan Cards - live from platform admin configuration */}
      <SubscriptionPlanCards
        onSelectPlan={(plan) => setUpgradeTarget(plan)}
        onCancelPlan={handleCancel}
        isProcessing={isProcessing}
      />

      {/* Guarantees */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-black flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
          <ShieldCheck className="w-5 h-5 text-black" />
          <span>What Happens When You Subscribe or Cancel</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <FileCheck2 className="w-4 h-4 text-neutral-700" />
              Data Preservation
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              All your measurement records, orders, and customer profiles are preserved regardless of your plan.
              Data visibility is controlled by the platform admin.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <RefreshCw className="w-4 h-4 text-neutral-700" />
              Flexible Billing
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              Monthly billing, cancel anytime. When a subscription expires, you transition back to trial limits
              automatically.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <HelpCircle className="w-4 h-4 text-neutral-700" />
              Support Included
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              All paid plans include access to our tailor support team. Pro plan members get priority
              response within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Checkout Modal */}
      {upgradeTarget && (
        <Modal
          isOpen={Boolean(upgradeTarget)}
          onClose={() => setUpgradeTarget(null)}
          title={upgradeTarget === 'base' ? 'Activate Base Workspace' : 'Upgrade to Pro Atelier'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">
                  {upgradeTarget === 'base' ? 'Base Workspace' : 'Pro Atelier'} — Monthly Plan
                </span>
                <span className="font-bold text-base font-mono text-black">
                  GH₵ {upgradeTarget === 'base' ? basePrice : proPrice} / mo
                </span>
              </div>
              <p className="text-[11px] text-[#777777]">
                Instant activation for {currentBusiness?.business_name}.{' '}
                {upgradeTarget === 'base'
                  ? 'Unlimited customers, full pipeline, offline sync.'
                  : 'Everything in Base plus unlimited staff, photo storage, and advanced exports.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-800 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mtn', 'telecel', 'card'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPaymentProvider(p)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentProvider === p
                        ? 'border-black bg-black text-white'
                        : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {p === 'card' ? (
                      <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    ) : (
                      <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    )}
                    <span className="font-semibold text-[11px] block">
                      {p === 'mtn' ? 'MTN MoMo' : p === 'telecel' ? 'Telecel Cash' : 'Debit Card'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-800 mb-1">
                {paymentProvider === 'card' ? 'Card Number' : 'Mobile Money Phone Number'}
              </label>
              <input
                type="text"
                placeholder={paymentProvider === 'card' ? '4123 4567 8901 2345' : 'e.g. 024 123 4567'}
                value={phoneOrCard}
                onChange={(e) => setPhoneOrCard(e.target.value)}
                className="w-full h-10 px-3 border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#777777]">Cancel or downgrade anytime</span>
              <Button
                onClick={handleUpgrade}
                disabled={isProcessing || !phoneOrCard.trim()}
                className="bg-black text-white hover:bg-neutral-800 text-xs gap-1.5 w-full sm:w-auto"
              >
                <ArrowRight className="w-4 h-4" />
                {isProcessing ? 'Activating…' : `Activate ${upgradeTarget === 'base' ? 'Base' : 'Pro'} Plan`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

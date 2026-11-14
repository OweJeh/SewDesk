import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Smartphone,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Users,
  Layers,
  Lock,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const {
    currentBusiness,
    currentRole,
    hasActiveSubscription,
    activateSubscription,
    cancelSubscription,
  } = useCurrentBusiness();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'telecel' | 'card'>('mtn');
  const [phoneOrCard, setPhoneOrCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const isNearLimit = slotsUsed >= 80;
  const isAtLimit = slotsUsed >= 100;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    const { error } = await activateSubscription();
    setIsProcessing(false);

    if (!error) {
      setIsUpgradeModalOpen(false);
      setSuccessMsg('Congratulations! Your atelier is now upgraded to Pro Tailor Studio.');
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleCancel = async () => {
    if (
      confirm(
        'Revert to Free Starter Plan? Your existing customer records, photos, and templates will remain 100% intact and accessible. Future actions will follow Free tier limits.'
      )
    ) {
      setIsProcessing(true);
      await cancelSubscription();
      setIsProcessing(false);
      setSuccessMsg('Your plan has reverted to Free Starter. All historical data remains preserved.');
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">
                Subscription & Studio Tier
              </h1>
              <Badge
                variant={hasActiveSubscription ? 'default' : 'outline'}
                className="text-[10px]"
              >
                {hasActiveSubscription ? 'Pro Studio Active' : 'Free Starter Tier'}
              </Badge>
            </div>
            <p className="text-xs text-[#777777] mt-1">
              Manage your workshop capacity, voluntary upgrades, and data preservation guarantees for{' '}
              <strong>{currentBusiness?.business_name}</strong>.
            </p>
          </div>

          {!hasActiveSubscription ? (
            <Button
              size="sm"
              onClick={() => setIsUpgradeModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Upgrade to Pro (GH₵ 150/mo)
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Revert to Free Plan
            </Button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Customer Allowance Progress Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Client Records & Studio Status
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-black">{slotsUsed}</span>
            <span className="text-sm font-mono text-neutral-400">
              {hasActiveSubscription ? ' (Unlimited Pro)' : ' / 100 Free'}
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-[#E5E5E5]">
          <div
            className={`h-full transition-all duration-500 ${
              hasActiveSubscription
                ? 'bg-black'
                : isAtLimit
                ? 'bg-red-600'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-black'
            }`}
            style={{ width: hasActiveSubscription ? '100%' : `${Math.min(100, (slotsUsed / 100) * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Free Allowance</p>
            <p className="text-sm font-bold text-black mt-0.5">100 Free Clients</p>
            <p className="text-[11px] text-[#777777] mt-1">Free forever for every studio</p>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Upgrade Freedom</p>
            <p className="text-sm font-bold text-black mt-0.5">Voluntary Anytime</p>
            <p className="text-[11px] text-[#777777] mt-1">Upgrade with 10, 30, or 100 clients</p>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Data Guarantee</p>
            <p className="text-sm font-bold text-black mt-0.5">Never Gatekept</p>
            <p className="text-[11px] text-[#777777] mt-1">Past photos & records stay intact</p>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Starter */}
        <div
          className={`bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between ${
            !hasActiveSubscription ? 'border-2 border-black' : 'border border-[#E5E5E5]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-black">Free Starter</h3>
              {!hasActiveSubscription && (
                <Badge variant="default" className="text-[10px]">
                  Current Active Plan
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#777777]">
              Essential digital tailoring workspace for single tailors and emerging fashion ateliers.
            </p>

            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold font-mono text-black">GH₵ 0</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Up to 100 lifetime customer profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Up to 3 custom templates (+ standard catalogs)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Up to 3 invited staff accounts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Interactive Body Measurement Ruler & tape</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Workshop order pipeline & production stages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Offline-aware Dexie persistence & sync</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E5E5]">
            <Button
              variant="outline"
              className="w-full"
              disabled={!hasActiveSubscription}
              onClick={handleCancel}
            >
              {!hasActiveSubscription ? 'Current Active Workspace Plan' : 'Downgrade to Free Starter'}
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={`rounded-xl p-6 shadow-sm flex flex-col justify-between ${
            hasActiveSubscription
              ? 'bg-white border-2 border-black'
              : 'bg-[#FAFAFA] border border-[#E5E5E5]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-black">Pro Tailor Studio</h3>
              {hasActiveSubscription ? (
                <Badge variant="default" className="text-[10px]">
                  Active Pro Plan
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Full Bespoke Scale
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#777777]">
              Unlimited client records, client & fabric photo storage, and multi-user atelier workflows.
            </p>

            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold font-mono text-black">GH₵ 150</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span><strong>Unlimited</strong> registered customers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span><strong>Unlimited</strong> custom measurement templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span><strong>Unlimited</strong> invited staff accounts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Fabric swatch & client photo cloud storage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Automated client fitting notices & WhatsApp share</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Advanced revenue & ledger reporting exports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Multi-device real-time cloud synchronization</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E5E5]">
            {!hasActiveSubscription ? (
              <Button
                className="w-full"
                onClick={() => setIsUpgradeModalOpen(true)}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Upgrade to Pro (GH₵ 150 / mo)
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancel}
              >
                Cancel / Downgrade Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Security, Expiry & Data Preservation Guarantees */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-black flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
          <ShieldCheck className="w-5 h-5 text-black" />
          <span>Our Guarantee: Your Data is Never Held Hostage</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600">
          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <ImageIcon className="w-4 h-4 text-neutral-700" />
              <span>Historical Photos Intact</span>
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              If your Pro plan expires, all fabric swatches and client photos you previously uploaded remain 100% visible and accessible. We never delete your craft data.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <RefreshCw className="w-4 h-4 text-neutral-700" />
              <span>Graceful Free Continuation</span>
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              When a Pro subscription ends, your workspace smoothly continues on the Free plan. Only new photo uploads and adding staff/templates beyond free limits are paused.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-black">
              <Lock className="w-4 h-4 text-neutral-700" />
              <span>Voluntary Upgrade Anytime</span>
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              You do not need 100 clients to upgrade. Any tailor with 10, 20, or 30 customers can willingly activate Pro at any time to enjoy photos, templates, and team seats.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Checkout Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade to Pro Tailor Studio"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">Pro Studio Monthly Plan</span>
              <span className="font-bold text-base font-mono text-black">GH₵ 150 / mo</span>
            </div>
            <p className="text-[11px] text-[#777777]">
              Instant activation for {currentBusiness?.business_name}. Unlimited clients, photo storage, unlimited custom templates, and team seats.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentProvider('mtn')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentProvider === 'mtn'
                    ? 'border-black bg-black text-white'
                    : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="font-semibold text-[11px] block">MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentProvider('telecel')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentProvider === 'telecel'
                    ? 'border-black bg-black text-white'
                    : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="font-semibold text-[11px] block">Telecel Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentProvider('card')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentProvider === 'card'
                    ? 'border-black bg-black text-white'
                    : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="font-semibold text-[11px] block">Debit Card</span>
              </button>
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
              className="w-full h-10 px-3 border border-[#E5E5E5] rounded-md text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
            <span className="text-[11px] text-[#777777]">Cancel or downgrade anytime</span>
            <Button
              onClick={handleUpgrade}
              isLoading={isProcessing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Activate Pro Studio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

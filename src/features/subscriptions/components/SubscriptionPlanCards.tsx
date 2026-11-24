import React from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Zap,
  CreditCard,
  ShieldCheck,
  Lock,
  Star,
  Users,
} from 'lucide-react';

export interface SubscriptionPlanCardsProps {
  onSelectPlan?: (plan: 'base' | 'pro') => void;
  onCancelPlan?: () => void;
  isProcessing?: boolean;
  compact?: boolean;
}

export const SubscriptionPlanCards: React.FC<SubscriptionPlanCardsProps> = ({
  onSelectPlan,
  onCancelPlan,
  isProcessing = false,
  compact = false,
}) => {
  const { accessState } = useCurrentBusiness();

  const {
    tier,
    maxSlots,
    trialDaysLeft,
    freeTrialDays,
    basePrice,
    proPrice,
    trialDescription,
    baseDescription,
    proDescription,
    baseFeatures,
    proFeatures,
    lockDataWhenExpired,
  } = accessState;

  const isFreeTrial = tier === 'free_trial';
  const isBase = tier === 'base';
  const isPro = tier === 'pro';

  return (
    <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 sm:gap-6`}>
      {/* 1. Free Trial Tier (hidden in compact upgrade modal if desired, or shown cleanly) */}
      {!compact && (
        <div
          className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between border-2 transition-all ${
            isFreeTrial ? 'border-black ring-1 ring-black/5' : 'border-[#E5E5E5]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
              <h3 className="text-base font-bold text-black tracking-tight">Free Trial</h3>
              {isFreeTrial && (
                <Badge variant="default" className="text-[10px] bg-black text-white font-mono">
                  Current Plan
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#777777] mb-4 leading-relaxed">
              {trialDescription}
            </p>

            <div className="mb-5 pb-4 border-b border-[#E5E5E5]">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-black">GH₵ 0</span>
              <span className="text-xs text-[#777777] ml-1.5">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <span>
                  Up to <strong>{maxSlots}</strong> customer profiles
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  {freeTrialDays} days trial
                  {trialDaysLeft !== null && (
                    <span className="font-semibold text-black block text-[11px] mt-0.5">
                      ({trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Trial ended'})
                    </span>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <span>Measurement tape &amp; order stages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <span>Offline-first Dexie local storage</span>
              </li>
              <li className="flex items-start gap-2">
                {lockDataWhenExpired ? (
                  <Lock className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] text-neutral-500">
                  {lockDataWhenExpired
                    ? 'Data locks when trial ends until subscribed'
                    : 'Data view preserved upon expiry'}
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
            <Button variant="outline" className="w-full text-xs" disabled>
              {isFreeTrial ? 'Current Active Workspace' : 'Trial Allowance'}
            </Button>
          </div>
        </div>
      )}

      {/* 2. Base Workspace Tier */}
      <div
        className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between border-2 transition-all ${
          isBase ? 'border-black ring-1 ring-black/5' : 'border-[#E5E5E5]'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
            <h3 className="text-base font-bold text-black tracking-tight">Base Workspace</h3>
            {isBase ? (
              <Badge variant="default" className="text-[10px] bg-black text-white font-mono">
                Current Plan
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 font-mono">
                Unlimited Clients
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#777777] mb-4 leading-relaxed">
            {baseDescription}
          </p>

          <div className="mb-5 pb-4 border-b border-[#E5E5E5]">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-black">GH₵ {basePrice}</span>
            <span className="text-xs text-[#777777] ml-1.5">/ month</span>
          </div>

          <ul className="space-y-2.5 text-xs text-neutral-700">
            {baseFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
          {isBase ? (
            <Button
              variant="outline"
              className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={onCancelPlan}
              disabled={isProcessing}
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button
              className="w-full text-xs bg-black text-white hover:bg-neutral-800 gap-1.5 shadow-sm"
              onClick={() => onSelectPlan?.('base')}
              disabled={isPro || isProcessing}
            >
              <Zap className="w-3.5 h-3.5" />
              {isPro ? 'Included in Pro' : `Activate Base — GH₵ ${basePrice}/mo`}
            </Button>
          )}
        </div>
      </div>

      {/* 3. Pro Atelier Tier */}
      <div
        className={`rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between border-2 transition-all ${
          isPro
            ? 'bg-black text-white border-black ring-1 ring-black/5'
            : 'bg-white border-[#E5E5E5]'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
            <h3 className={`text-base font-bold tracking-tight ${isPro ? 'text-white' : 'text-black'}`}>
              Pro Atelier
            </h3>
            {isPro ? (
              <Badge className="text-[10px] bg-white text-black font-mono">
                Current Plan
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-neutral-300 text-neutral-800 bg-neutral-50 font-mono">
                <Star className="w-2.5 h-2.5 mr-1 inline text-amber-500 fill-amber-500" />
                Full Bespoke Scale
              </Badge>
            )}
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isPro ? 'text-neutral-400' : 'text-[#777777]'}`}>
            {proDescription}
          </p>

          <div className={`mb-5 pb-4 border-b ${isPro ? 'border-neutral-800' : 'border-[#E5E5E5]'}`}>
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${isPro ? 'text-white' : 'text-black'}`}>
              GH₵ {proPrice}
            </span>
            <span className={`text-xs ml-1.5 ${isPro ? 'text-neutral-400' : 'text-[#777777]'}`}>
              / month
            </span>
          </div>

          <ul className={`space-y-2.5 text-xs ${isPro ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {proFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isPro ? 'text-emerald-400' : 'text-black'}`}
                />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`mt-6 pt-4 border-t ${isPro ? 'border-neutral-800' : 'border-[#E5E5E5]'}`}>
          {isPro ? (
            <Button
              variant="outline"
              className="w-full text-xs text-red-400 border-red-900 hover:bg-red-950 bg-transparent"
              onClick={onCancelPlan}
              disabled={isProcessing}
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button
              className="w-full text-xs bg-black text-white hover:bg-neutral-800 gap-1.5 shadow-sm"
              onClick={() => onSelectPlan?.('pro')}
              disabled={isProcessing}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Upgrade to Pro — GH₵ {proPrice}/mo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


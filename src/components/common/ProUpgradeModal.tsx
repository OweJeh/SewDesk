import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Zap,
  Star,
  ShieldCheck,
} from 'lucide-react';

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  featureDescription?: string;
  onContinueAnyway?: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName = 'Pro Atelier Feature',
  featureDescription = 'Upgrade your atelier to Pro Tailor Studio to unlock full access to this feature and supercharge your workshop.',
  onContinueAnyway,
}) => {
  const { currentBusiness, accessState, activateProTier, activateBaseTier } = useCurrentBusiness();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'base'>('pro');
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'telecel' | 'card'>('mtn');
  const [phoneOrCard, setPhoneOrCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { basePrice, proPrice, proFeatures } = accessState;
  const currentPrice = selectedPlan === 'pro' ? proPrice : basePrice;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    const { error } =
      selectedPlan === 'pro' ? await activateProTier() : await activateBaseTier();
    setIsProcessing(false);

    if (error) {
      setErrorMsg(error.message || 'Payment activation failed. Please try again.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workshop Subscription Upgrade"
    >
      <div className="space-y-4 text-xs">
        {/* Feature highlight header */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-black text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-300" />
              Pro Feature
            </span>
            <span className="font-mono text-sm font-bold text-white">
              GH₵ {currentPrice} / mo
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{featureName}</h4>
            <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
              {featureDescription}
            </p>
          </div>
        </div>

        {/* Plan Choice Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedPlan('pro')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPlan === 'pro'
                ? 'border-black bg-black text-white shadow-sm'
                : 'border-[#E5E5E5] bg-white text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Pro Atelier</span>
              <span className="font-mono text-xs font-semibold">GH₵ {proPrice}</span>
            </div>
            <p className={`text-[10px] mt-0.5 ${selectedPlan === 'pro' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Full bespoke scale, photo vault &amp; tools
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('base')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPlan === 'base'
                ? 'border-black bg-black text-white shadow-sm'
                : 'border-[#E5E5E5] bg-white text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Base Workspace</span>
              <span className="font-mono text-xs font-semibold">GH₵ {basePrice}</span>
            </div>
            <p className={`text-[10px] mt-0.5 ${selectedPlan === 'base' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Unlimited customers &amp; order stages
            </p>
          </button>
        </div>

        {/* Pro Benefits quick list */}
        {selectedPlan === 'pro' && (
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-1.5 text-neutral-700">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Included in Pro Atelier:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {proFeatures.slice(0, 6).map((feat, idx) => (
                <span key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                  <span className="truncate">{feat}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment selector */}
        <div>
          <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
            Instant Mobile Checkout
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentProvider('mtn')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                paymentProvider === 'mtn'
                  ? 'border-black bg-black text-white font-medium'
                  : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] block font-semibold">MTN MoMo</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentProvider('telecel')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                paymentProvider === 'telecel'
                  ? 'border-black bg-black text-white font-medium'
                  : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] block font-semibold">Telecel Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentProvider('card')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                paymentProvider === 'card'
                  ? 'border-black bg-black text-white font-medium'
                  : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] block font-semibold">Card</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-700 mb-1">
            {paymentProvider === 'card' ? 'Debit / Credit Card Number' : 'Mobile Money Phone Number'}
          </label>
          <input
            type="text"
            placeholder={paymentProvider === 'card' ? '4123 4567 8901 2345' : 'e.g. 024 123 4567'}
            value={phoneOrCard}
            onChange={(e) => setPhoneOrCard(e.target.value)}
            className="w-full h-9 px-3 border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-black"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
          {onContinueAnyway ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onContinueAnyway();
              }}
              className="text-[11px] text-neutral-500 hover:text-black underline underline-offset-2"
            >
              View existing data
            </button>
          ) : (
            <span className="text-[10px] text-neutral-400">Cancel or downgrade anytime</span>
          )}

          <Button
            size="sm"
            onClick={handleUpgrade}
            isLoading={isProcessing}
            disabled={!phoneOrCard.trim() || isProcessing}
            className="bg-black text-white hover:bg-neutral-800 text-xs gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Activate {selectedPlan === 'pro' ? 'Pro' : 'Base'} (GH₵ {currentPrice}/mo)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

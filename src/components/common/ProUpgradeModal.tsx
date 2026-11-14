import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  ArrowRight,
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
  const { currentBusiness, activateSubscription } = useCurrentBusiness();
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'telecel' | 'card'>('mtn');
  const [phoneOrCard, setPhoneOrCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    const { error } = await activateSubscription();
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
      title="Upgrade to Pro Tailor Studio"
    >
      <div className="space-y-4 text-xs">
        {/* Feature highlight header */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-black text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Pro Feature Locked
            </span>
            <span className="font-mono text-sm font-bold text-white">GH₵ 150 / mo</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{featureName}</h4>
            <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
              {featureDescription}
            </p>
          </div>
        </div>

        {/* Benefits quick list */}
        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg space-y-1.5 text-neutral-700">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Included with Pro Tailor Studio:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              Fabric & Posture Photo Vault
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              1-Click WhatsApp Dispatcher
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              Garment Bag Tags & QR Slips
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              Piece-Rate Commission Payroll
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              Digital Measurement Cards
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              Fabric Yardage Estimator
            </span>
          </div>
        </div>

        {/* Payment selector */}
        <div>
          <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
            Instant Mobile Checkout
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentProvider('mtn')}
              className={`p-2.5 rounded-lg border text-center transition-all ${
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
              className={`p-2.5 rounded-lg border text-center transition-all ${
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
              className={`p-2.5 rounded-lg border text-center transition-all ${
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
            className="w-full h-9 px-3 border border-[#E5E5E5] rounded-md text-xs focus:outline-none focus:border-black"
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
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Upgrade Now (GH₵ 150)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

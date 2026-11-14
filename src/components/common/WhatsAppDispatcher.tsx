// ==============================================================================
// SEWDESK – WHATSAPP DISPATCHER
// Pre-composed WhatsApp message templates for fitting reminders and pickup notifications
// ==============================================================================

import React, { useState } from 'react';
import { MessageSquare, Copy, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { ProUpgradeModal } from '@/components/common/ProUpgradeModal';

interface WhatsAppDispatcherProps {
  customerName: string;
  phone?: string | null;
  whatsapp?: string | null;
  studioName?: string | null;
  garmentType?: string | null;
  fittingDate?: string | null;
  balance?: number;
  currency?: string;
}

function buildWaUrl(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WhatsAppDispatcher: React.FC<WhatsAppDispatcherProps> = ({
  customerName,
  phone,
  whatsapp,
  studioName = 'our studio',
  garmentType = 'outfit',
  fittingDate,
  balance = 0,
  currency = 'GHS',
}) => {
  const { hasActiveSubscription } = useCurrentBusiness();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'fitting' | 'pickup' | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const wa = whatsapp || phone;
  if (!wa) return null;

  const name = customerName || 'Valued Customer';
  const studio = studioName || 'our studio';
  const garment = garmentType || 'outfit';

  const fittingMsg = fittingDate
    ? `Hello ${name}, your fitting for your ${garment} is scheduled. Please visit ${studio} at your earliest convenience. We look forward to seeing you!\n\nSewDesk – ${studio}`
    : `Hello ${name}, your ${garment} is progressing well and your fitting appointment is coming up soon. Please contact us to confirm your fitting date.\n\nSewDesk – ${studio}`;

  const pickupMsg = `Hello ${name}, great news! Your ${garment} is ready for collection. 🎉\n\n${
    balance > 0
      ? `Remaining balance: ${currency} ${balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}\n\n`
      : 'Your account is fully settled.\n\n'
  }Visit us at ${studio} during business hours to pick up your outfit.\n\nThank you for choosing SewDesk – ${studio}`;

  const handleCopy = async (msg: string, type: 'fitting' | 'pickup') => {
    await copyToClipboard(msg);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  };

  const handle1ClickSend = (e: React.MouseEvent, url: string) => {
    if (!hasActiveSubscription) {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-center gap-1.5 py-1.5 font-semibold rounded-lg text-xs transition-all ${
          !hasActiveSubscription
            ? 'bg-[#25D366]/10 text-[#128C7E] opacity-75 hover:opacity-100'
            : 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
        {!hasActiveSubscription && (
          <span className="text-[8px] font-bold uppercase tracking-wider bg-black text-white px-1 py-0.2 rounded">
            PRO
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 overflow-hidden min-w-[280px]">
          {/* Fitting Reminder */}
          <div className="p-3 border-b border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Fitting Reminder
              </span>
              {!hasActiveSubscription && (
                <span className="text-[9px] font-bold bg-black text-white px-1 rounded">PRO 1-CLICK</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed bg-[#F5F5F5] rounded-lg p-2 mb-2 whitespace-pre-line">
              {fittingMsg}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => handle1ClickSend(e, buildWaUrl(wa, fittingMsg))}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  !hasActiveSubscription
                    ? 'bg-neutral-800 text-white opacity-70 hover:opacity-100'
                    : 'bg-[#25D366] text-white hover:bg-[#1ebe5d]'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                {!hasActiveSubscription ? '1-Click Dispatch' : 'Send on WhatsApp'}
              </button>
              <button
                onClick={() => handleCopy(fittingMsg, 'fitting')}
                title="Copy message text"
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-[11px] hover:bg-[#F5F5F5] transition-colors"
              >
                {copied === 'fitting' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </button>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Ready for Pickup
              </span>
              {!hasActiveSubscription && (
                <span className="text-[9px] font-bold bg-black text-white px-1 rounded">PRO 1-CLICK</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed bg-[#F5F5F5] rounded-lg p-2 mb-2 whitespace-pre-line">
              {pickupMsg}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => handle1ClickSend(e, buildWaUrl(wa, pickupMsg))}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  !hasActiveSubscription
                    ? 'bg-neutral-800 text-white opacity-70 hover:opacity-100'
                    : 'bg-[#25D366] text-white hover:bg-[#1ebe5d]'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                {!hasActiveSubscription ? '1-Click Dispatch' : 'Send on WhatsApp'}
              </button>
              <button
                onClick={() => handleCopy(pickupMsg, 'pickup')}
                title="Copy message text"
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 border border-[#E5E5E5] rounded-lg text-[11px] hover:bg-[#F5F5F5] transition-colors"
              >
                {copied === 'pickup' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </button>
            </div>
          </div>

          <div className="px-3 py-2 bg-[#FAFAFA] border-t border-[#E5E5E5]">
            <button onClick={() => setOpen(false)} className="text-[10px] text-neutral-400 hover:text-neutral-700 w-full text-center">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Pro Upgrade Modal for 1-Click WhatsApp Dispatch */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="1-Click WhatsApp Dispatcher"
        featureDescription="Tailors save hours every week. Pro gives you 1-click automatic WhatsApp dispatch for fitting appointments and collection balance reminders."
      />
    </div>
  );
};


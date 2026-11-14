// ==============================================================================
// SEWDESK – WHATSAPP DISPATCHER
// Pre-composed WhatsApp message templates for fitting reminders and pickup notifications
// ==============================================================================

import React, { useState } from 'react';
import { MessageSquare, Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'fitting' | 'pickup' | null>(null);

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
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(type);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-semibold rounded-lg text-xs transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        WhatsApp
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Fitting Reminder */}
          <div className="p-3 border-b border-[#E5E5E5]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Fitting Reminder</div>
            <p className="text-[11px] text-neutral-600 leading-relaxed bg-[#F5F5F5] rounded-lg p-2 mb-2 whitespace-pre-line">
              {fittingMsg}
            </p>
            <div className="flex gap-1.5">
              <a
                href={buildWaUrl(wa, fittingMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold hover:bg-[#1ebe5d] transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Send on WhatsApp
              </a>
              <button
                onClick={() => handleCopy(fittingMsg, 'fitting')}
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
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Ready for Pickup</div>
            <p className="text-[11px] text-neutral-600 leading-relaxed bg-[#F5F5F5] rounded-lg p-2 mb-2 whitespace-pre-line">
              {pickupMsg}
            </p>
            <div className="flex gap-1.5">
              <a
                href={buildWaUrl(wa, pickupMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold hover:bg-[#1ebe5d] transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Send on WhatsApp
              </a>
              <button
                onClick={() => handleCopy(pickupMsg, 'pickup')}
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
    </div>
  );
};


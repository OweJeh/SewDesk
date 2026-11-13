import React from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { currentBusiness, currentRole } = useCurrentBusiness();

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const isNearLimit = slotsUsed >= 80;
  const isAtLimit = slotsUsed >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">
                Subscription & Allowance
              </h1>
              <Badge variant="default" className="text-[10px]">
                Free Starter Tier
              </Badge>
            </div>
            <p className="text-xs text-[#777777] mt-1">
              Authoritative lifetime customer records allowance for{' '}
              <strong>{currentBusiness?.business_name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Allowance Progress Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Customer Registration Allowance
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-black">{slotsUsed}</span>
            <span className="text-sm font-mono text-neutral-400"> / 100</span>
          </div>
        </div>

        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-[#E5E5E5]">
          <div
            className={`h-full transition-all duration-500 ${
              isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-black'
            }`}
            style={{ width: `${Math.min(100, (slotsUsed / 100) * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Free Allowance</p>
            <p className="text-sm font-bold text-black mt-0.5">100 Customers</p>
            <p className="text-[11px] text-[#777777] mt-1">Free forever for every studio</p>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Paid Tier Trigger</p>
            <p className="text-sm font-bold text-black mt-0.5">Customer #101</p>
            <p className="text-[11px] text-[#777777] mt-1">GHS 150 / month thereafter</p>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
            <p className="text-[10px] uppercase font-semibold text-[#777777]">Allowance Policy</p>
            <p className="text-sm font-bold text-black mt-0.5">Authoritative Lifetime</p>
            <p className="text-[11px] text-[#777777] mt-1">Archived records do not reset count</p>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-black">Free Starter</h3>
              <Badge variant="default" className="text-[10px]">
                Active Plan
              </Badge>
            </div>
            <p className="text-xs text-[#777777]">
              Essential digital tailoring workspace for emerging artisans and single-tailor workshops.
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
                <span>Interactive Body Measurement Ruler</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Workshop order pipeline & production stages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Multi-user staff access included</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Offline-aware Dexie persistence & sync</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E5E5]">
            <Button variant="outline" className="w-full" disabled>
              Current Active Workspace Plan
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-black">Pro Tailor Studio</h3>
              <Badge variant="outline" className="text-[10px]">
                Full Bespoke Scale
              </Badge>
            </div>
            <p className="text-xs text-[#777777]">
              Unlimited client records and higher-volume studio workflows for growing fashion businesses.
            </p>

            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold font-mono text-black">GH₵ 150</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Unlimited registered customers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>All tailoring measurement templates & custom fields</span>
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
                <span>Multi-device synchronization</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E5E5]">
            <Button
              className="w-full"
              disabled={slotsUsed < 80}
              onClick={() => alert('Subscription payment gateway integration (Paystack/Hubtel) ready. Payment request will be processed when customer threshold is reached.')}
            >
              {slotsUsed < 80 ? 'Available when reaching 100 clients' : 'Subscribe for GH₵ 150 / mo'}
            </Button>
          </div>
        </div>
      </div>

      {/* Security and Expiry Guarantees */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-black flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Our Guarantee: Your Data is Never Held Hostage</span>
        </h3>
        <p className="text-xs text-[#777777] leading-relaxed">
          If your paid subscription ever expires, your existing customers, historical measurements,
          garment orders, and payments remain 100% accessible and exportable. We never delete historical data. Only creating new client records beyond the free 100-customer threshold is restricted until renewal.
        </p>
      </div>
    </div>
  );
};


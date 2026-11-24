import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Lock, Users, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useSubscriptionConfig } from '@/features/subscriptions/services/subscriptionConfig';

export const PricingPage: React.FC = () => {
  const config = useSubscriptionConfig();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
          Transparent Atelier Pricing
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
          {config.trialType === 'trial_days'
            ? `Start Free for ${config.freeTrialDays} Days. Simple Scale Thereafter.`
            : config.trialType === 'customer_quota'
            ? `Free for ${config.freeCustomerLimit} Clients. Simple Scale Thereafter.`
            : `Free for ${config.freeCustomerLimit} Clients or ${config.freeTrialDays} Days.`}
        </h1>
        <p className="text-sm text-[#777777] max-w-2xl mx-auto leading-relaxed">
          We believe in growing alongside your fashion atelier. Start with our generous free trial, then continue on Base Workspace for GH₵ {config.baseTierPriceGHS}/mo or unlock full Pro Atelier capabilities for GH₵ {config.proTierPriceGHS}/mo.
        </p>
      </div>

      {/* 3-Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Tier 1: Free Trial */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Free Trial</h3>
              <Badge variant="secondary" className="text-[10px]">Starter</Badge>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">
              {config.trialDescription || 'Ideal for emerging tailors and testing SewDesk in your workshop.'}
            </p>
            <div className="pt-1">
              <span className="text-4xl font-extrabold font-mono text-black">GH₵ 0</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-700 pt-4 border-t border-[#E5E5E5]">
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Up to <strong>{config.freeCustomerLimit}</strong> client profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span><strong>{config.freeTrialDays} days</strong> full workspace trial</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Tactile Interactive Tailoring Ruler</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Workshop order production pipeline</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Offline-aware Dexie persistence</span>
              </li>
              <li className="flex items-start gap-2 text-neutral-500">
                {config.lockDataWhenExpired ? (
                  <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px]">
                  {config.lockDataWhenExpired
                    ? 'Data locks on expiry until subscribed to Base or Pro'
                    : 'Read-only data access preserved on expiry'}
                </span>
              </li>
            </ul>
          </div>

          <Link to="/register" className="block pt-4">
            <Button variant="outline" className="w-full text-xs">
              Start Free Workspace
            </Button>
          </Link>
        </div>

        {/* Tier 2: Base Workspace */}
        <div className="bg-white border-2 border-black rounded-2xl p-7 shadow-md flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Base Workspace</h3>
              <Badge variant="default" className="bg-black text-white text-[10px] font-mono">
                Recommended
              </Badge>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">
              {config.baseDescription || 'Essential digital workspace for active tailor shops with unlimited clients.'}
            </p>
            <div className="pt-1">
              <span className="text-4xl font-extrabold font-mono text-black">GH₵ {config.baseTierPriceGHS}</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-700 pt-4 border-t border-[#E5E5E5]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span><strong>Unlimited client profiles</strong> &amp; measurements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Tactile Interactive Tailoring Ruler</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Workshop order tracking &amp; status stages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Up to 3 invited tailor staff accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Continuous cloud backup &amp; data access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Multi-payment deposit tracking &amp; balances</span>
              </li>
            </ul>
          </div>

          <Link to="/register" className="block pt-4">
            <Button className="w-full text-xs bg-black text-white hover:bg-neutral-800 font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Base Workspace (GH₵ {config.baseTierPriceGHS}/mo)
            </Button>
          </Link>
        </div>

        {/* Tier 3: Pro Atelier */}
        <div className="bg-black text-white rounded-2xl p-7 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Pro Atelier</h3>
              <Badge variant="outline" className="border-white/20 text-white bg-white/10 text-[10px] font-mono">
                Full Atelier
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {config.proDescription || 'For established fashion houses, high-volume bespoke clothiers, and multiple tailors.'}
            </p>
            <div className="pt-1">
              <span className="text-4xl font-extrabold font-mono text-white">GH₵ {config.proTierPriceGHS}</span>
              <span className="text-xs text-neutral-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-300 pt-4 border-t border-neutral-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span><strong>Everything in Base Workspace</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> invited tailor staff accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Fabric swatch &amp; client posture photo vault</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Piece-rate tailor commission payroll tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Automated WhatsApp fitting notices &amp; dispatch</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Digital measurement cards &amp; share links</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Advanced revenue &amp; ledger export to CSV/PDF</span>
              </li>
            </ul>
          </div>

          <Link to="/register" className="block pt-4">
            <Button className="w-full text-xs bg-white text-black hover:bg-neutral-100 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Pro Atelier (GH₵ {config.proTierPriceGHS}/mo)
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="pt-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black">Feature Comparison</h2>
          <p className="text-xs text-[#777777] mt-1">Detailed breakdown of features across all plans</p>
        </div>

        <div className="overflow-x-auto border border-[#E5E5E5] rounded-xl bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
              <tr>
                <th className="p-3.5 font-bold text-black">Capability</th>
                <th className="p-3.5 font-bold text-black text-center">Free Trial</th>
                <th className="p-3.5 font-bold text-black text-center bg-neutral-100/60">Base (GH₵ {config.baseTierPriceGHS})</th>
                <th className="p-3.5 font-bold text-black text-center">Pro (GH₵ {config.proTierPriceGHS})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr>
                <td className="p-3.5 font-medium text-black">Customer Profile Allowance</td>
                <td className="p-3.5 text-center text-neutral-600">{config.freeCustomerLimit} clients</td>
                <td className="p-3.5 text-center font-semibold text-black bg-neutral-100/60">Unlimited</td>
                <td className="p-3.5 text-center font-semibold text-black">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Trial Duration</td>
                <td className="p-3.5 text-center text-neutral-600">{config.freeTrialDays} days</td>
                <td className="p-3.5 text-center text-neutral-600 bg-neutral-100/60">Permanent</td>
                <td className="p-3.5 text-center text-neutral-600">Permanent</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Interactive Body Ruler &amp; Tape</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold bg-neutral-100/60">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Workshop Production Pipeline</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold bg-neutral-100/60">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Invited Workshop Staff Seats</td>
                <td className="p-3.5 text-center text-neutral-600">1 seat</td>
                <td className="p-3.5 text-center text-neutral-700 bg-neutral-100/60">Up to 3 seats</td>
                <td className="p-3.5 text-center font-semibold text-black">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Fabric Swatch &amp; Posture Vault</td>
                <td className="p-3.5 text-center text-neutral-400">&mdash;</td>
                <td className="p-3.5 text-center text-neutral-400 bg-neutral-100/60">&mdash;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Piece-Rate Tailor Commissions</td>
                <td className="p-3.5 text-center text-neutral-400">&mdash;</td>
                <td className="p-3.5 text-center text-neutral-400 bg-neutral-100/60">&mdash;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">WhatsApp Fitting Reminders</td>
                <td className="p-3.5 text-center text-neutral-400">&mdash;</td>
                <td className="p-3.5 text-center text-neutral-400 bg-neutral-100/60">&mdash;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Digital Measurement Cards &amp; QR</td>
                <td className="p-3.5 text-center text-neutral-400">&mdash;</td>
                <td className="p-3.5 text-center text-neutral-400 bg-neutral-100/60">&mdash;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Offline-Aware Dexie Persistence</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold bg-neutral-100/60">&#10003;</td>
                <td className="p-3.5 text-center text-black font-semibold">&#10003;</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Data Access on Expiry</td>
                <td className="p-3.5 text-center text-neutral-600">
                  {config.lockDataWhenExpired ? 'Locked until active' : 'Read-only'}
                </td>
                <td className="p-3.5 text-center font-semibold text-black bg-neutral-100/60">Full Access</td>
                <td className="p-3.5 text-center font-semibold text-black">Full Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

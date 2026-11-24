import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ruler,
  Scissors,
  Users,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Zap,
  History,
  Lock,
} from 'lucide-react';
import { useSubscriptionConfig } from '@/features/subscriptions/services/subscriptionConfig';

export const HomePage: React.FC = () => {
  const config = useSubscriptionConfig();
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero Section with Tailor Desk Background */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-8 pb-4">
        {/* Tailor's Desk Background */}
        <div className="absolute inset-0 -top-8 -bottom-8 pointer-events-none overflow-hidden select-none rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{
              backgroundImage: 'url(/images/tailor-desk-bg.jpg)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-xs font-semibold uppercase tracking-wider text-black">
            <span>The Digital Tailoring Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black max-w-4xl mx-auto leading-tight">
            MEASURE. MANAGE. CREATE.
          </h1>

          <p className="text-base sm:text-xl text-black font-medium max-w-2xl mx-auto leading-relaxed">
            Replace paper measurement books, scattered order slips, and manual bookkeeping with a luxury digital workspace engineered for master tailors, bespoke clothiers, and fashion studios.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Free Workspace
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Interactive Ruler
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-800 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" /> {config.freeCustomerLimit} free client profiles
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" /> {config.freeTrialDays}-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" /> Offline-aware sync
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Product Feature Teaser */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
                Signature Innovation
              </span>
              <h2 className="text-2xl font-bold text-black mt-1">Interactive Tailoring Ruler</h2>
              <p className="text-xs text-[#777777] mt-1">
                Designed to feel like an artisanal measuring tape in your hands, not a cold database table.
              </p>
            </div>
            <Link to="/features">
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View Full Specifications
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl space-y-2">
              <Ruler className="w-6 h-6 text-black" />
              <h3 className="text-sm font-bold text-black">Precision Ruler Controls</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Fine (0.1) and coarse (0.5) step adjustments with instant cm-to-inch conversions and touch dragging.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl space-y-2">
              <History className="w-6 h-6 text-black" />
              <h3 className="text-sm font-bold text-black">Immutable Measurement History</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Past fitting sessions are never overwritten. Every order binds permanently to the exact measurement session used.
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl space-y-2">
              <Scissors className="w-6 h-6 text-black" />
              <h3 className="text-sm font-bold text-black">Workshop Production Pipeline</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Track status across Cutting, Sewing, Fitting, Ready, and Delivery with team-wide visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-black">
            Built for Modern Tailoring Houses
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-2">
            Every feature is purpose-crafted for the bespoke fashion workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-3">
            <Users className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black">Client Profiles</h3>
            <p className="text-xs text-[#777777]">
              Customer numbers, WhatsApp links, fitting preferences, and lifetime order logs.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-3">
            <CreditCard className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black">Multi-Payment Ledgers</h3>
            <p className="text-xs text-[#777777]">
              Track initial deposits, partial payments, and automated balance recalculations.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-3">
            <Zap className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black">Offline-Aware PWA</h3>
            <p className="text-xs text-[#777777]">
              Unstable connection in the workshop? Work continues smoothly and syncs on reconnection.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-3">
            <ShieldCheck className="w-5 h-5 text-black" />
            <h3 className="text-sm font-bold text-black">Multi-Tenant Isolation</h3>
            <p className="text-xs text-[#777777]">
              Enterprise-grade PostgreSQL Row Level Security guarantees data privacy between studios.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Pricing Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div>
          <Badge variant="outline" className="text-[10px]">
            Simple Transparent Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-black mt-2">
            {config.trialType === 'trial_days'
              ? `Start with a ${config.freeTrialDays}-day free trial.`
              : config.trialType === 'customer_quota'
              ? `Free for your first ${config.freeCustomerLimit} clients.`
              : `Free for your first ${config.freeCustomerLimit} clients or ${config.freeTrialDays} days.`}
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl mx-auto">
            Continue on Base Workspace for just GH₵ {config.baseTierPriceGHS}/mo or unlock Pro Atelier for GH₵ {config.proTierPriceGHS}/mo. No hidden setup fees or surprise charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {/* Free Trial */}
          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-black">Free Trial</h3>
                <Badge variant="secondary" className="text-[10px]">Trial</Badge>
              </div>
              <p className="text-xs text-[#777777]">
                {config.trialDescription || 'Essential digital tailoring workspace with trial capacity.'}
              </p>
              <div className="text-3xl font-bold font-mono text-black">
                GH₵ 0 <span className="text-xs font-normal text-[#777777]">/ mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-600 pt-2 border-t border-[#E5E5E5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Up to {config.freeCustomerLimit} client profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>{config.freeTrialDays} days full access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Interactive Body Ruler &amp; orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Offline-aware Dexie database</span>
                </li>
                <li className="flex items-center gap-2 text-[11px] text-neutral-500">
                  {config.lockDataWhenExpired ? (
                    <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>
                    {config.lockDataWhenExpired
                      ? 'Data locks when trial ends until subscribed'
                      : 'Data view preserved upon expiry'}
                  </span>
                </li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="outline" className="w-full text-xs">
                Start Free Workspace
              </Button>
            </Link>
          </div>

          {/* Base Workspace */}
          <div className="p-6 bg-white border-2 border-black rounded-xl flex flex-col justify-between space-y-6 shadow-sm relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-black">Base Workspace</h3>
                <Badge variant="default" className="text-[10px] bg-black text-white font-mono">
                  Standard Studio
                </Badge>
              </div>
              <p className="text-xs text-[#777777]">
                {config.baseDescription || 'Full studio workflow with unlimited customer records.'}
              </p>
              <div className="text-3xl font-bold font-mono text-black">
                GH₵ {config.baseTierPriceGHS} <span className="text-xs font-normal text-[#777777]">/ mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-700 pt-2 border-t border-[#E5E5E5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <strong>Unlimited client records</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Workshop production pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Interactive Tailoring Tape</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Up to 3 invited staff accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Data stored &amp; accessible 24/7</span>
                </li>
              </ul>
            </div>
            <Link to="/register">
              <Button className="w-full text-xs bg-black text-white hover:bg-neutral-800">
                Choose Base Workspace
              </Button>
            </Link>
          </div>

          {/* Pro Atelier */}
          <div className="p-6 bg-black text-white rounded-xl flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Pro Atelier</h3>
                <Badge variant="outline" className="text-[10px] border-white/20 text-white bg-white/10 font-mono">
                  Full Scale
                </Badge>
              </div>
              <p className="text-xs text-neutral-400">
                {config.proDescription || 'Unlimited clients, photo vault, WhatsApp dispatch, custom templates, and team seats.'}
              </p>
              <div className="text-3xl font-bold font-mono text-white">
                GH₵ {config.proTierPriceGHS} <span className="text-xs font-normal text-neutral-400">/ mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <strong>Everything in Base Workspace</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Unlimited tailor staff accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Fabric swatch &amp; photo vault</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>WhatsApp client dispatch &amp; fitting alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Piece-rate tailor commission payroll</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Custom measurement templates</span>
                </li>
              </ul>
            </div>
            <Link to="/register">
              <Button className="w-full text-xs bg-white text-black hover:bg-neutral-100 font-semibold">
                Start Pro Atelier
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Compare Full Plan Specifications <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-10 sm:p-14 space-y-6">
        <h2 className="text-3xl font-bold text-black">Ready to digitize your tailoring studio?</h2>
        <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto">
          Join tailoring businesses taking control of their measurement history, order production, and customer records.
        </p>
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Free Account Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero Section with Tailor Desk Background */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-8 pb-4">
        {/* Tailor's Desk Background */}
        <div className="absolute inset-0 -top-8 -bottom-8 pointer-events-none overflow-hidden select-none rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: 'url(/images/tailor-desk-bg.jpg)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-xs font-semibold uppercase tracking-wider text-black">
            <span>The Digital Tailoring Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black max-w-4xl mx-auto leading-tight">
            MEASURE. MANAGE. CREATE.
          </h1>

          <p className="text-base sm:text-xl text-[#777777] max-w-2xl mx-auto leading-relaxed">
            Replace paper measurement books, scattered order slips, and manual bookkeeping with a luxury digital workspace engineered for master tailors, bespoke clothiers, and fashion studios.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Free Workspace (100 Clients Free)
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Interactive Ruler
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#777777]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" /> 100 free customer records
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-black" /> Unlimited workshop staff
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div>
          <Badge variant="outline" className="text-[10px]">
            Simple Transparent Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-black mt-2">
            Free for your first 100 clients.
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl mx-auto">
            From client #101, pay just GH₵ 150 per month for unlimited scale. No hidden fees or per-seat charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          <div className="p-6 bg-white border border-[#E5E5E5] rounded-xl space-y-4">
            <h3 className="text-base font-bold text-black">Free Starter</h3>
            <p className="text-xs text-[#777777]">Everything needed to digitize a boutique tailor studio.</p>
            <div className="text-2xl font-bold font-mono text-black">GH₵ 0 / mo</div>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>&bull; 100 free customer records</li>
              <li>&bull; Interactive Body Ruler</li>
              <li>&bull; Workshop order pipeline</li>
              <li>&bull; Unlimited staff seats</li>
            </ul>
          </div>

          <div className="p-6 bg-black text-white rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white">Pro Studio</h3>
            <p className="text-xs text-neutral-400">For scaling bespoke houses and fashion workshops.</p>
            <div className="text-2xl font-bold font-mono text-white">GH₵ 150 / mo</div>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>&bull; Unlimited registered customers</li>
              <li>&bull; Custom measurement templates</li>
              <li>&bull; Advanced financial analytics</li>
              <li>&bull; Unlimited staff seats</li>
            </ul>
          </div>
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

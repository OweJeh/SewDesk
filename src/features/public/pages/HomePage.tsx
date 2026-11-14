import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Scissors,
  Ruler,
  BookOpen,
  Layers,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  Clock,
  Check,
} from 'lucide-react';
import {
  MeasurementIllustration,
  DressFormIllustration,
  ScissorsIllustration,
  OrderIllustration,
  PaymentIllustration,
  SecurityIllustration,
  PWAIllustration,
  HeroStitchIllustration,
  AnimatedFeatureCard,
  AnimatedHeroDecoration,
  StaggeredSection,
} from '@/components/illustrations';
import { ThreadWord } from '@/components/ui/thread-text';

/* ────────────── Motion Presets ────────────── */

const luxuryEase = [0.16, 1, 0.3, 1] as const;

const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.8, delay, ease: luxuryEase }}
    >
      {children}
    </motion.div>
  );
};

/* ────────────── Page Component ────────────── */

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ruler' | 'pipeline' | 'ledger'>('ruler');

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* ═══════════ 1. GRAND EDITORIAL HERO SECTION ═══════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] text-white border border-neutral-800 shadow-2xl">
          {/* Prominent Tailor's Desk Photograph Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-luminosity scale-100 transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: 'url(/images/tailor-desk-bg.jpg)',
            }}
          />

          {/* Luxury Studio Vignette & Contrast Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/75 to-[#0A0A0A]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_20%,transparent_0%,#0A0A0A_90%)]" />

          {/* Decorative Needle & Thread Stitch Accent */}
          <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none select-none opacity-20">
            <HeroStitchIllustration className="w-full max-w-3xl" color="#FFFFFF" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center space-y-8">
            {/* Status / Category Pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: luxuryEase }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-neutral-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>
                <ThreadWord className="text-[1.35em] text-white mr-1">The</ThreadWord>
                Digital Tailoring Workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Signature Brand Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: luxuryEase }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              <span className="font-thread text-5xl sm:text-7xl lg:text-8xl text-neutral-100 font-normal mr-2 align-middle inline-block">
                Measure.
              </span>
              <span className="tracking-tight">MANAGE. CREATE.</span>
            </motion.h1>

            {/* Editorial Lead Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: luxuryEase }}
              className="text-base sm:text-lg lg:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-normal"
            >
              <ThreadWord className="text-[1.3em] text-white mr-1">Replace</ThreadWord>
              paper measurement books, scattered order slips, and manual bookkeeping with an artisanal digital workspace engineered for master tailors, bespoke clothiers, and fashion studios.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-black hover:bg-neutral-100 font-semibold shadow-lg shadow-white/10"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  <ThreadWord className="text-[1.35em] text-black mr-1.5 font-normal">Start</ThreadWord>
                  Free Workspace (100 Clients Free)
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800 backdrop-blur-sm"
                  leftIcon={<Scissors className="w-4 h-4 text-neutral-300" />}
                >
                  <ThreadWord className="text-[1.35em] text-white mr-1.5 font-normal">Explore</ThreadWord>
                  Interactive Ruler
                </Button>
              </Link>
            </motion.div>

            {/* Hero Proof & Guarantee Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-neutral-800/80 text-left"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-neutral-300 font-medium">
                  <strong className="text-white">100 Clients</strong> Free Forever
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-neutral-300 font-medium">
                  <strong className="text-white">0.1cm</strong> Precision Ruler
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-neutral-300 font-medium">
                  <strong className="text-white">Unlimited</strong> Workshop Staff
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-neutral-300 font-medium">
                  <strong className="text-white">Offline-Aware</strong> PWA Sync
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. PHYSICAL ATELIER TOOLS TO DIGITAL PRECISION ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#777777]">
              <ThreadWord className="text-[1.3em] text-black mr-1">Artisanal</ThreadWord>
              Heritage &bull; Digital Future
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
              <ThreadWord className="text-[1.3em] text-black font-normal mr-2">Built</ThreadWord>
              for the Master Tailor's Workbench
            </h2>
            <p className="text-sm text-[#777777] max-w-xl mx-auto">
              Every tool on our cutting table has an exact digital counterpart crafted to respect the tailor's physical habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tool 1 */}
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-4 hover:border-black/30 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Physical Tool
                </span>
                <h3 className="text-base font-bold text-black mt-0.5">
                  <ThreadWord className="text-[1.28em] font-normal mr-1">Fabric</ThreadWord>
                  Shears
                </h3>
              </div>
              <p className="text-xs text-[#777777] leading-relaxed">
                Connects to the <strong>Workshop Production Pipeline</strong>. Track garment progress across Cutting, Sewing, Fitting, and Final Delivery.
              </p>
            </div>

            {/* Tool 2 */}
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-4 hover:border-black/30 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Ruler className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Physical Tool
                </span>
                <h3 className="text-base font-bold text-black mt-0.5">
                  <ThreadWord className="text-[1.28em] font-normal mr-1">Measuring</ThreadWord>
                  Tape
                </h3>
              </div>
              <p className="text-xs text-[#777777] leading-relaxed">
                Connects to the <strong>Interactive Touch Ruler</strong>. 0.1 fine adjustments, coarse sliding, and automatic centimeter-to-inch conversions.
              </p>
            </div>

            {/* Tool 3 */}
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-4 hover:border-black/30 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Physical Tool
                </span>
                <h3 className="text-base font-bold text-black mt-0.5">
                  <ThreadWord className="text-[1.28em] font-normal mr-1">Tailor</ThreadWord>
                  Chalk & Pins
                </h3>
              </div>
              <p className="text-xs text-[#777777] leading-relaxed">
                Connects to <strong>Immutable Measurement History</strong>. Previous client sessions are never overwritten; every order links to exact fitting specs.
              </p>
            </div>

            {/* Tool 4 */}
            <div className="p-6 bg-white border border-[#E5E5E5] rounded-2xl space-y-4 hover:border-black/30 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Physical Tool
                </span>
                <h3 className="text-base font-bold text-black mt-0.5">
                  <ThreadWord className="text-[1.28em] font-normal mr-1">Pattern</ThreadWord>
                  Ledger
                </h3>
              </div>
              <p className="text-xs text-[#777777] leading-relaxed">
                Connects to <strong>Multi-Payment Balances</strong>. Record initial deposits, fabric surcharges, and balance recalculations instantly.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ 3. INTERACTIVE FEATURE TEASER & PREVIEW ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-[#E5E5E5] bg-[#FAFAFA] p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
                  <ThreadWord className="text-[1.3em] text-black mr-1">Signature</ThreadWord>
                  Innovation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-black mt-1">
                  <ThreadWord className="text-[1.3em] text-black font-normal mr-1.5">Interactive</ThreadWord>
                  Tailoring Ruler
                </h2>
                <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl">
                  Designed to feel like an artisanal measuring tape in your hands, not a cold database table.
                </p>
              </div>
              <Link to="/features">
                <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  <ThreadWord className="text-[1.25em] text-black mr-1 font-normal">View</ThreadWord>
                  Full Specifications
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedFeatureCard
                illustration={<MeasurementIllustration className="w-full h-full" />}
                title="Precision Ruler Controls"
                description="Fine (0.1) and coarse (0.5) step adjustments with instant cm-to-inch conversions and touch dragging."
                delay={0}
              />
              <AnimatedFeatureCard
                illustration={<OrderIllustration className="w-full h-full" />}
                title="Immutable Measurement History"
                description="Past fitting sessions are never overwritten. Every order binds permanently to the exact measurement session used."
                delay={0.12}
              />
              <AnimatedFeatureCard
                illustration={<ScissorsIllustration className="w-full h-full" />}
                title="Workshop Production Pipeline"
                description="Track status across Cutting, Sewing, Fitting, Ready, and Delivery with team-wide visibility."
                delay={0.24}
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ 4. CORE PLATFORM PILLARS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <StaggeredSection className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
            <ThreadWord className="text-[1.3em] text-black mr-1">Engineered</ThreadWord>
            For Bespoke Houses
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-black">
            <ThreadWord className="text-[1.3em] text-black font-normal mr-1.5">Built</ThreadWord>
            for Modern Tailoring Studios
          </h2>
          <p className="text-xs sm:text-sm text-[#777777]">
            Every feature is purpose-crafted for the bespoke fashion workflow.
          </p>
        </StaggeredSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedFeatureCard
            illustration={<DressFormIllustration className="w-full h-full" />}
            title="Client Profiles"
            description="Customer numbers, WhatsApp links, fitting preferences, and lifetime order logs."
            delay={0}
          />
          <AnimatedFeatureCard
            illustration={<PaymentIllustration className="w-full h-full" />}
            title="Multi-Payment Ledgers"
            description="Track initial deposits, partial payments, and automated balance recalculations."
            delay={0.1}
          />
          <AnimatedFeatureCard
            illustration={<PWAIllustration className="w-full h-full" />}
            title="Offline-Aware PWA"
            description="Unstable connection in the workshop? Work continues smoothly and syncs on reconnection."
            delay={0.2}
          />
          <AnimatedFeatureCard
            illustration={<SecurityIllustration className="w-full h-full" />}
            title="Multi-Tenant Isolation"
            description="Enterprise-grade PostgreSQL Row Level Security guarantees data privacy between studios."
            delay={0.3}
          />
        </div>
      </section>

      {/* ═══════════ 5. TRANSPARENT PRICING ═══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <StaggeredSection className="space-y-2">
          <Badge variant="outline" className="text-[10px]">
            <ThreadWord className="text-[1.3em] text-black mr-1">Simple</ThreadWord>
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mt-2">
            <ThreadWord className="text-[1.32em] text-black font-normal mr-1.5">Free</ThreadWord>
            for your first 100 clients.
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl mx-auto">
            From client #101, pay just GH₵ 150 per month for unlimited scale. No hidden fees or per-seat charges.
          </p>
        </StaggeredSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
          {/* Free Starter */}
          <FadeIn delay={0.1}>
            <div className="p-8 bg-white border border-[#E5E5E5] rounded-3xl space-y-6 h-full shadow-sm hover:border-black/30 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-black">
                    <ThreadWord className="text-[1.3em] text-black font-normal mr-1">Free</ThreadWord>
                    Starter
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">Forever Free</Badge>
                </div>
                <p className="text-xs text-[#777777]">
                  Everything needed to digitize an independent tailor studio.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold font-mono text-black">GH₵ 0</span>
                  <span className="text-xs text-[#777777] ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-neutral-700 pt-4 border-t border-[#E5E5E5]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>100 free lifetime customer records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>Interactive Body Ruler touch controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>Workshop production pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>Unlimited workshop staff seats</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="block pt-2">
                <Button variant="outline" className="w-full">
                  <ThreadWord className="text-[1.25em] text-black mr-1 font-normal">Start</ThreadWord>
                  Free Forever
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Pro Studio */}
          <FadeIn delay={0.2}>
            <div className="p-8 bg-black text-white rounded-3xl space-y-6 h-full shadow-2xl flex flex-col justify-between border border-neutral-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    <ThreadWord className="text-[1.3em] text-white font-normal mr-1">Pro</ThreadWord>
                    Studio
                  </h3>
                  <Badge className="bg-white text-black text-[10px]">Unlimited Scale</Badge>
                </div>
                <p className="text-xs text-neutral-400">
                  For scaling bespoke houses and multi-tailor ateliers.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold font-mono text-white">GH₵ 150</span>
                  <span className="text-xs text-neutral-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-neutral-300 pt-4 border-t border-neutral-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Unlimited registered customer records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Custom measurement templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Advanced financial analytics & export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>Priority concierge atelier support</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="block pt-2">
                <Button className="w-full bg-white text-black hover:bg-neutral-100" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  <ThreadWord className="text-[1.25em] text-black mr-1 font-normal">Upgrade</ThreadWord>
                  to Pro Studio
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ 6. FINAL EDITORIAL CALL TO ACTION ═══════════ */}
      <FadeIn>
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#0A0A0A] text-white border border-neutral-800 p-10 sm:p-16 text-center space-y-6 overflow-hidden shadow-2xl">
            {/* Background Texture */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
              style={{
                backgroundImage: 'url(/images/tailor-desk-bg.jpg)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/60" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                <ThreadWord className="text-[1.3em] text-white mr-1">Join</ThreadWord>
                The Digital Atelier Revolution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                <ThreadWord className="text-[1.32em] text-white font-normal mr-2">Ready</ThreadWord>
                to elevate your tailoring studio?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Take control of your measurement history, order production pipeline, and customer records in minutes. Free forever for your first 100 clients.
              </p>
              <div className="pt-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-black hover:bg-neutral-100 font-semibold shadow-lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    <ThreadWord className="text-[1.3em] text-black mr-1.5 font-normal">Claim</ThreadWord>
                    Your Studio Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
};

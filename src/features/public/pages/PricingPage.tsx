import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-[10px]">Transparent SaaS Pricing</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
          Free for 100 Clients. Simple Scale Thereafter.
        </h1>
        <p className="text-sm text-[#777777] max-w-xl mx-auto">
          We believe in growing alongside your fashion atelier. No hidden setup fees, no artificial per-seat employee limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Starter */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">Free Starter</h3>
              <Badge variant="secondary" className="text-[10px]">Forever Free</Badge>
            </div>
            <p className="text-xs text-[#777777]">
              Ideal for independent tailors and new fashion design ateliers.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-extrabold font-mono text-black">GH₵ 0</span>
              <span className="text-xs text-[#777777] ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-700 pt-4 border-t border-[#E5E5E5]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Up to 100 lifetime registered client profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Interactive Tailoring Ruler Picker</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Unlimited workshop team seats (Tailors, Apprentices)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Offline-aware IndexedDB persistence</span>
              </li>
            </ul>
          </div>

          <Link to="/register" className="block pt-4">
            <Button variant="outline" className="w-full">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Pro Studio */}
        <div className="bg-black text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Pro Studio</h3>
              <Badge variant="default" className="bg-white text-black text-[10px]">Unlimited Scale</Badge>
            </div>
            <p className="text-xs text-neutral-400">
              For established bespoke houses, busy ateliers, and multiple tailors.
            </p>
            <div className="pt-2">
              <span className="text-4xl font-extrabold font-mono text-white">GH₵ 150</span>
              <span className="text-xs text-neutral-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-300 pt-4 border-t border-neutral-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Unlimited client profiles & measurement records</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Custom measurement template designer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Advanced revenue & ledger export to CSV/PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Priority platform support</span>
              </li>
            </ul>
          </div>

          <Link to="/register" className="block pt-4">
            <Button className="w-full bg-white text-black hover:bg-neutral-100" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start with 100 Free Clients
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};


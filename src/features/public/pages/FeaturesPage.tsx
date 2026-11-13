import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ruler, Scissors, Users, CreditCard, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-[10px]">Product Capabilities</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
          Engineered for the Precision of Bespoke Tailoring
        </h1>
        <p className="text-sm text-[#777777] leading-relaxed">
          SewDesk is built around the real physical workflow of cutting tables, measuring tapes, and fitting sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
            <Ruler className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-black">Interactive Body Ruler</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Record client anatomy with our touch-enabled digital ruler. Use 0.1 fine adjustments or 0.5 coarse leaps, switch between centimetres and inches seamlessly, and retain canonical centimeter records for mathematical consistency.
          </p>
        </div>

        <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-black">Garment Production Pipeline</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Track each garment order across clear workshop milestones: Not Started, Cutting, Sewing, Fitting, Ready, and Delivered. Assign garments to apprentices or senior tailors and preserve status change logs.
          </p>
        </div>

        <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-black">Multi-Payment Ledgers</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Bespoke orders rarely get paid in a single lump sum. Record deposits, staged fitting installments, and final collections via Cash, Mobile Money, or Bank Transfer, with automatic balance updates and printable receipts.
          </p>
        </div>

        <div className="p-8 bg-white border border-[#E5E5E5] rounded-xl space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-black">Enterprise Multi-Tenancy</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Complete database-level data isolation via PostgreSQL Row Level Security. Studio A can never access Studio B's client lists, measurements, or financial ledgers under any circumstances.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Free Studio Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
};


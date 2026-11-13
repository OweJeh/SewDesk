import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Scissors,
  Ruler,
  CreditCard,
  UserPlus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentBusiness, currentRole } = useCurrentBusiness();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [dismissChecklist, setDismissChecklist] = useState(false);

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const currency = currentBusiness?.default_currency ?? 'GHS';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Tailor'}
            </h1>
            <Badge variant="outline" className="text-[10px]">
              {currentBusiness?.business_type}
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Studio: <strong>{currentBusiness?.business_name}</strong> &bull; Location: {currentBusiness?.city}, {currentBusiness?.country}
          </p>
        </div>

        {/* Quick Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/app/customers')}
            leftIcon={<Users className="w-3.5 h-3.5" />}
          >
            Add Customer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/measurements')}
            leftIcon={<Ruler className="w-3.5 h-3.5" />}
          >
            Measurements
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/orders')}
            leftIcon={<Scissors className="w-3.5 h-3.5" />}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Customer Allowance Banner */}
      <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Free Customer Allowance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-black">
              {slotsUsed} <span className="text-neutral-400 font-normal">/ 100</span>
            </span>
            <span className="text-[11px] text-neutral-500">records used</span>
          </div>
        </div>

        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              slotsUsed >= 100 ? 'bg-red-600' : slotsUsed >= 80 ? 'bg-amber-500' : 'bg-black'
            }`}
            style={{ width: `${Math.min(100, (slotsUsed / 100) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#777777] mt-2">
          <span>First 100 registered customers are 100% free forever.</span>
          {slotsUsed >= 80 && (
            <Link
              to="/app/subscription"
              className="text-black font-semibold underline hover:text-neutral-700"
            >
              Upgrade to Pro (GHS 150/mo) &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Total Customers
            </span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-black">{slotsUsed}</span>
            <span className="text-xs text-neutral-400">active</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Active Orders
            </span>
            <Scissors className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-black">0</span>
            <span className="text-xs text-neutral-400">in workshop</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Revenue Collected
            </span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-black">
              {formatCurrency(0, currency)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Outstanding Balances
            </span>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-black">
              {formatCurrency(0, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Checklist (if new studio) */}
      {!dismissChecklist && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
            <div>
              <h3 className="text-sm font-bold text-black">Studio Setup Checklist</h3>
              <p className="text-xs text-[#777777]">
                Follow these steps to fully digitize your workshop workflows.
              </p>
            </div>
            <button
              onClick={() => setDismissChecklist(true)}
              className="text-xs text-neutral-400 hover:text-black font-medium"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">1. Customers & Bodies</span>
                <Users className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-xs text-[#777777]">
                Add your clients and start recording their exact measurements.
              </p>
              <Link to="/app/customers" className="inline-block pt-1">
                <span className="text-xs font-semibold text-black hover:underline flex items-center gap-1">
                  Add first customer &rarr;
                </span>
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">2. Interactive Ruler</span>
                <Ruler className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-xs text-[#777777]">
                Try the interactive tailoring ruler picker for seamless body fitting.
              </p>
              <Link to="/app/measurements" className="inline-block pt-1">
                <span className="text-xs font-semibold text-black hover:underline flex items-center gap-1">
                  Explore ruler &rarr;
                </span>
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">3. Invite Staff</span>
                <UserPlus className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-xs text-[#777777]">
                Add tailors, assistants, and accountants. No extra cost per seat.
              </p>
              <Link to="/app/staff" className="inline-block pt-1">
                <span className="text-xs font-semibold text-black hover:underline flex items-center gap-1">
                  Invite workshop team &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


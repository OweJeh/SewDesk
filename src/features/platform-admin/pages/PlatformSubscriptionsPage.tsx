import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Business, Customer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Sliders,
  Sparkles,
  CreditCard,
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface StudioSubscription {
  business: Business;
  customerCount: number;
  isPro: boolean;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

export const PlatformSubscriptionsPage: React.FC = () => {
  const [studios, setStudios] = useState<StudioSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pro' | 'free' | 'near-limit'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isLive = isSupabaseConfigured();

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      let bizList: Business[] = [];
      let custList: Customer[] = [];

      if (isLive) {
        const [bizRes, custRes] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*'),
        ]);
        if (bizRes.data) bizList = bizRes.data as Business[];
        if (custRes.data) custList = custRes.data as Customer[];
      } else {
        const [bData, cData] = await Promise.all([
          db.businesses.toArray(),
          db.customers.toArray(),
        ]);
        bizList = bData;
        custList = cData;
      }

      const mapped: StudioSubscription[] = bizList.map((b) => {
        const matchingCustomers = custList.filter((c) => c.business_id === b.id);
        const count = Math.max(matchingCustomers.length, b.customer_slots_used || 0);
        const isPro = count > 100;
        const isNearLimit = !isPro && count >= 80;
        const isAtLimit = !isPro && count >= 100;

        return {
          business: b,
          customerCount: count,
          isPro,
          isNearLimit,
          isAtLimit,
        };
      });

      setStudios(mapped);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Aggregates
  const proCount = studios.filter((s) => s.isPro).length;
  const freeCount = studios.length - proCount;
  const nearLimitCount = studios.filter((s) => s.isNearLimit).length;
  const estimatedMRR = proCount * 150; // GHS 150 / mo standard plan

  // Filtered
  const filteredStudios = useMemo(() => {
    return studios.filter((s) => {
      if (filterMode === 'pro' && !s.isPro) return false;
      if (filterMode === 'free' && s.isPro) return false;
      if (filterMode === 'near-limit' && !s.isNearLimit && !s.isAtLimit) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.business.business_name?.toLowerCase().includes(q) ||
        s.business.contact_email?.toLowerCase().includes(q) ||
        s.business.city?.toLowerCase().includes(q)
      );
    });
  }, [studios, filterMode, searchTerm]);

  // Toggle Pro Subscription
  const handleToggleSubscription = async (studio: StudioSubscription) => {
    setIsProcessing(studio.business.id);
    try {
      const newSlots = studio.isPro ? 25 : 150;
      if (isLive) {
        await supabase
          .from('businesses')
          .update({ customer_slots_used: newSlots, updated_at: new Date().toISOString() })
          .eq('id', studio.business.id);
      } else {
        await db.businesses.update(studio.business.id, {
          customer_slots_used: newSlots,
          updated_at: new Date().toISOString(),
        });
      }
      await loadSubscriptions();
    } catch (err) {
      console.error('Error modifying subscription:', err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Subscriptions
            </h1>
            <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs font-mono">
              GHS 150 / mo Standard
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global view of studio subscription tiers, customer allowances, and upgrade enforcement.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadSubscriptions}
          disabled={isLoading}
          className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatCurrency(estimatedMRR, 'GHS')}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">From active Pro recurring subscriptions</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pro Studios</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white">
            {proCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Unlimited customer capacity</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Free Tier Studios</span>
            <Building2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white">
            {freeCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Capped at 100 client records</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Near Free Limit</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-amber-400">
            {nearLimitCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">&gt; 80% customer allowance used</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subscriptions by studio or email..."
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({studios.length})
          </button>
          <button
            onClick={() => setFilterMode('pro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'pro' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pro Active ({proCount})
          </button>
          <button
            onClick={() => setFilterMode('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'free' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Free Tier ({freeCount})
          </button>
          <button
            onClick={() => setFilterMode('near-limit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'near-limit' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Near Limit ({nearLimitCount})
          </button>
        </div>
      </div>

      {/* Subscription List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {filteredStudios.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <Sliders className="w-8 h-8 mx-auto text-neutral-700" />
            <p>No studio subscriptions matching criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {filteredStudios.map((s) => {
              const percent = s.isPro ? 100 : Math.min(100, (s.customerCount / 100) * 100);
              const isWorking = isProcessing === s.business.id;

              return (
                <div
                  key={s.business.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
                >
                  {/* Studio Info */}
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{s.business.business_name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono ${
                          s.isPro
                            ? 'border-emerald-700 text-emerald-400 bg-emerald-950/40'
                            : s.isAtLimit
                            ? 'border-red-700 text-red-400 bg-red-950/40'
                            : s.isNearLimit
                            ? 'border-amber-700 text-amber-400 bg-amber-950/40'
                            : 'border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {s.isPro ? 'PRO ACTIVE' : s.isAtLimit ? 'LIMIT REACHED' : s.isNearLimit ? 'NEAR LIMIT' : 'FREE TIER'}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {s.business.contact_email || 'No email'} &bull; {s.business.city || 'Accra'}, {s.business.country || 'Ghana'}
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full md:w-64 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 text-[11px]">Allowance Used:</span>
                      <span className="font-mono text-white text-xs">
                        {s.isPro ? `${s.customerCount} (Unlimited)` : `${s.customerCount} / 100`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          s.isPro ? 'bg-emerald-500' : s.isAtLimit ? 'bg-red-500' : s.isNearLimit ? 'bg-amber-500' : 'bg-neutral-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isWorking}
                      onClick={() => handleToggleSubscription(s)}
                      className={`text-xs h-8 px-3 border-neutral-700 hover:bg-neutral-800 ${
                        s.isPro ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      {isWorking ? 'Updating...' : s.isPro ? 'Downgrade to Free' : 'Grant Pro Upgrade'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

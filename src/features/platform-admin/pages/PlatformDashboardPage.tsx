import React, { useState, useEffect } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  CreditCard,
  Sliders,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  History,
} from 'lucide-react';

export const PlatformDashboardPage: React.FC = () => {
  const [businessCount, setBusinessCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const isLive = isSupabaseConfigured();

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        if (isLive) {
          const { count: bCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
          const { count: cCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
          setBusinessCount(bCount || 0);
          setCustomerCount(cCount || 0);
          return;
        }
        // Local Dexie count
        const bCount = await db.businesses.count();
        const cCount = await db.customers.count();
        setBusinessCount(bCount);
        setCustomerCount(cCount);
      } catch (err) {
        console.error('Error fetching platform metrics:', err);
      }
    };

    fetchPlatformStats();
  }, [isLive]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Platform Operations Dashboard
            </h1>
            <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono">
              INTERNAL
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Realtime multi-tenant monitoring across all independent tailoring studios.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Studios</span>
            <Building2 className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">{businessCount}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Registered tenant workspaces</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">{customerCount}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Across all registered businesses</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Paid Subs</span>
            <Sliders className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-green-400">0</div>
          <p className="text-[11px] text-neutral-500 mt-1">GHS 150/mo subscriber studios</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform MRR</span>
            <CreditCard className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-white">GH₵ 0.00</div>
          <p className="text-[11px] text-neutral-500 mt-1">Monthly Recurring Revenue</p>
        </div>
      </div>

      {/* Security and Tenant Isolation Compliance */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-neutral-400" />
          <span>Tenant Data Privacy Policy</span>
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          SewDesk platform operators monitor studio health, billing status, and subscription contracts without violating business privacy. Platform administrators cannot browse individual customer measurement records or private customer notes without an audited support authorization token.
        </p>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Payment, Order, Business, Customer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Search,
  Filter,
  ArrowDownLeft,
  Smartphone,
  Banknote,
  Building,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Receipt,
} from 'lucide-react';

interface UnifiedTransaction {
  id: string;
  orderNumber: string;
  studioName: string;
  customerName: string;
  amount: number;
  currency: string;
  method: 'mobile_money' | 'cash' | 'bank_transfer' | 'other';
  reference: string;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

export const PlatformTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'mobile_money' | 'cash' | 'bank_transfer'>('all');

  const isLive = isSupabaseConfigured();

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      let paymentsData: Payment[] = [];
      let ordersData: Order[] = [];
      let businessesData: Business[] = [];
      let customersData: Customer[] = [];

      if (isLive) {
        const [payRes, ordRes, bizRes, custRes] = await Promise.all([
          supabase.from('payments').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('businesses').select('*'),
          supabase.from('customers').select('*'),
        ]);

        if (payRes.data) paymentsData = payRes.data as Payment[];
        if (ordRes.data) ordersData = ordRes.data as Order[];
        if (bizRes.data) businessesData = bizRes.data as Business[];
        if (custRes.data) customersData = custRes.data as Customer[];
      } else {
        const [pData, oData, bData, cData] = await Promise.all([
          db.payments.toArray(),
          db.orders.toArray(),
          db.businesses.toArray(),
          db.customers.toArray(),
        ]);
        paymentsData = pData;
        ordersData = oData;
        businessesData = bData;
        customersData = cData;
      }

      const bizMap = new Map<string, string>();
      businessesData.forEach((b) => bizMap.set(b.id, b.business_name));

      const custMap = new Map<string, string>();
      customersData.forEach((c) => custMap.set(c.id, c.full_name));

      const orderMap = new Map<string, Order>();
      ordersData.forEach((o) => orderMap.set(o.id, o));

      const unified: UnifiedTransaction[] = [];

      // 1. Add explicitly recorded payment entries
      paymentsData.forEach((p) => {
        const ord = orderMap.get(p.order_id);
        unified.push({
          id: p.id,
          orderNumber: ord?.order_number || 'ORD-GEN',
          studioName: bizMap.get(p.business_id) || 'Unknown Studio',
          customerName: custMap.get(p.customer_id) || 'Walk-in Client',
          amount: Number(p.amount) || 0,
          currency: p.currency || 'GHS',
          method: p.method || 'mobile_money',
          reference: p.reference || `REF-${p.id.slice(0, 8).toUpperCase()}`,
          date: p.payment_date || p.created_at,
          status: p.status || 'completed',
        });
      });

      // 2. If payments table has few records but orders have deposits/payments recorded, synthesize them
      if (paymentsData.length === 0) {
        ordersData
          .filter((o) => (o.amount_paid || 0) > 0)
          .forEach((o) => {
            unified.push({
              id: `txn-${o.id}`,
              orderNumber: o.order_number,
              studioName: bizMap.get(o.business_id) || 'Unknown Studio',
              customerName: custMap.get(o.customer_id) || 'Client',
              amount: Number(o.amount_paid) || 0,
              currency: o.currency || 'GHS',
              method: 'mobile_money',
              reference: `DEP-${o.order_number}`,
              date: o.created_at,
              status: 'completed',
            });
          });
      }

      unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(unified);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Aggregates
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const momoTxns = transactions.filter((t) => t.method === 'mobile_money');
  const cashTxns = transactions.filter((t) => t.method === 'cash');
  const bankTxns = transactions.filter((t) => t.method === 'bank_transfer');

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (methodFilter !== 'all' && t.method !== methodFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.orderNumber.toLowerCase().includes(q) ||
        t.studioName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q)
      );
    });
  }, [transactions, methodFilter, searchTerm]);

  const getMethodBadge = (method: UnifiedTransaction['method']) => {
    switch (method) {
      case 'mobile_money':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <Smartphone className="w-3 h-3" />
            MoMo
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <Banknote className="w-3 h-3" />
            Cash
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/60">
            <Building className="w-3 h-3" />
            Bank
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">
            Other
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Transactions
            </h1>
            <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs font-mono">
              Financial Ledger
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Audited cross-studio payment verifications, Mobile Money settlements, and cash reconciliations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadTransactions}
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
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Settlements</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatCurrency(totalVolume, 'GHS')}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">{transactions.length} total payments reconciled</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mobile Money</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white">
            {momoTxns.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {formatCurrency(momoTxns.reduce((s, t) => s + t.amount, 0), 'GHS')} processed
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Direct Cash</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white">
            {cashTxns.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {formatCurrency(cashTxns.reduce((s, t) => s + t.amount, 0), 'GHS')} collected
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Bank Transfer</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white">
            {bankTxns.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {formatCurrency(bankTxns.reduce((s, t) => s + t.amount, 0), 'GHS')} transferred
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by order, studio, client, or reference..."
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setMethodFilter('mobile_money')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'mobile_money' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Mobile Money
          </button>
          <button
            onClick={() => setMethodFilter('cash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'cash' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setMethodFilter('bank_transfer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              methodFilter === 'bank_transfer' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bank
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-neutral-700" />
            <p>No transaction records matching filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Studio</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {t.reference}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      {t.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200 font-medium max-w-[140px] truncate">
                      {t.studioName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 max-w-[140px] truncate">
                      {t.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      {getMethodBadge(t.method)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-400 font-mono text-[11px]">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="default" className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px]">
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

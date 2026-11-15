import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Business, Customer, Order, Payment } from '@/types';
import {
  Building2,
  Users,
  CreditCard,
  Sliders,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  History,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Scissors,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlatformDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const isLive = isSupabaseConfigured();

  const loadPlatformData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isLive) {
        const [bizRes, custRes, ordRes, payRes] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*').order('created_at', { ascending: false }),
        ]);

        if (bizRes.data) setBusinesses(bizRes.data as Business[]);
        if (custRes.data) setCustomers(custRes.data as Customer[]);
        if (ordRes.data) setOrders(ordRes.data as Order[]);
        if (payRes.data) setPayments(payRes.data as Payment[]);
      } else {
        const [bizData, custData, ordData, payData, mCount] = await Promise.all([
          db.businesses.toArray(),
          db.customers.toArray(),
          db.orders.toArray(),
          db.payments.toArray(),
          db.measurementSets.count(),
        ]);

        setBusinesses(bizData);
        setCustomers(custData);
        setOrders(ordData);
        setPayments(payData);
        setMeasurementCount(mCount);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching platform metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  // Derived aggregates
  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.total_price) || 0), 0);
  const totalCollected = orders.reduce((sum, ord) => sum + (Number(ord.amount_paid) || 0), 0);
  const totalOutstanding = orders.reduce((sum, ord) => sum + (Number(ord.balance) || 0), 0);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const proStudios = businesses.filter((b) => (b.customer_slots_used || 0) > 100);

  // Business ID to Business Name lookup map
  const businessMap = new Map<string, string>();
  businesses.forEach((b) => businessMap.set(b.id, b.business_name));

  // Customer ID to Customer Name lookup map
  const customerMap = new Map<string, string>();
  customers.forEach((c) => customerMap.set(c.id, c.full_name));

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'ready':
      case 'delivered':
        return <Badge variant="default" className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">{status.replace('_', ' ')}</Badge>;
      case 'cutting':
      case 'sewing':
      case 'fitting':
        return <Badge variant="default" className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px]">{status}</Badge>;
      case 'cancelled':
        return <Badge variant="default" className="bg-red-950 text-red-400 border border-red-800 text-[10px]">cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Overview
            </h1>
            <Badge variant="default" className="bg-red-600 text-white text-[10px] font-mono">
              ROOT ADMIN
            </Badge>
            <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px] font-mono">
              {isLive ? 'Supabase Live' : 'Dexie IndexedDB'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Realtime tenant monitoring across all tailoring studios and workshops.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-neutral-500 font-mono hidden md:inline">
            Sync: {lastRefreshed.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPlatformData}
            disabled={isLoading}
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Studios */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Registered Studios
            </span>
            <div className="p-2 bg-neutral-800/80 rounded-lg text-white">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-bold text-white">
            {businesses.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
            <span>{proStudios.length} Pro / {businesses.length - proStudios.length} Free</span>
            <Link to="/platform/businesses" className="text-neutral-400 hover:text-white flex items-center gap-0.5">
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Tailoring Clients
            </span>
            <div className="p-2 bg-neutral-800/80 rounded-lg text-white">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-bold text-white">
            {customers.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
            <span>Across all tenant studios</span>
            <span className="font-mono text-neutral-400">
              {businesses.length ? (customers.length / businesses.length).toFixed(1) : 0} avg/studio
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Platform Orders
            </span>
            <div className="p-2 bg-neutral-800/80 rounded-lg text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-bold text-white">
            {orders.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
            <span className="text-blue-400">{activeOrders.length} in production</span>
            <span>{orders.filter((o) => o.status === 'delivered').length} delivered</span>
          </div>
        </div>

        {/* Gross Order Volume */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Gross Platform GMV
            </span>
            <div className="p-2 bg-neutral-800/80 rounded-lg text-white">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-bold text-emerald-400 truncate">
            {formatCurrency(totalRevenue, 'GHS')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
            <span>Collected: {formatCurrency(totalCollected, 'GHS')}</span>
            <Link to="/platform/transactions" className="text-neutral-400 hover:text-white flex items-center gap-0.5">
              <span>Audit</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Operational Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-900/60 border border-neutral-800 p-4 rounded-xl text-xs">
        <div className="space-y-0.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Outstanding Balance</div>
          <div className="font-mono font-semibold text-amber-400">
            {formatCurrency(totalOutstanding, 'GHS')}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Completed Payments</div>
          <div className="font-mono font-semibold text-white">
            {payments.length} transactions
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Measurement Sessions</div>
          <div className="font-mono font-semibold text-white">
            {measurementCount || customers.length} recorded
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Platform Subscriptions</div>
          <div className="font-mono font-semibold text-emerald-400">
            {proStudios.length * 150 > 0 ? formatCurrency(proStudios.length * 150, 'GHS') + '/mo' : 'GHS 0.00/mo'}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Recent Studios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Platform Orders (2 cols) */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-neutral-400" />
              <h2 className="text-sm font-bold text-white">Recent Cross-Studio Orders</h2>
            </div>
            <Link
              to="/platform/transactions"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>View all transactions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No orders recorded across the platform yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/60 border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Studio</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Garment</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {orders.slice(0, 8).map((ord) => {
                    const studioName = businessMap.get(ord.business_id) || 'Unknown Studio';
                    const clientName = customerMap.get(ord.customer_id) || ord.customer?.full_name || 'Walk-in';
                    return (
                      <tr key={ord.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-white">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4 text-neutral-300 max-w-[130px] truncate">
                          {studioName}
                        </td>
                        <td className="py-3 px-4 text-neutral-300 max-w-[130px] truncate">
                          {clientName}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 truncate">
                          {ord.garment_type}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-right text-white">
                          {formatCurrency(ord.total_price, ord.currency || 'GHS')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(ord.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Registered Studios Spotlight (1 col) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-400" />
              <h2 className="text-sm font-bold text-white">Active Studios</h2>
            </div>
            <Link
              to="/platform/businesses"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[420px]">
            {businesses.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No businesses registered yet.
              </div>
            ) : (
              businesses.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                      {b.business_name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono ${
                        (b.customer_slots_used || 0) > 100
                          ? 'border-emerald-700 text-emerald-400'
                          : 'border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {(b.customer_slots_used || 0) > 100 ? 'PRO' : 'FREE TIER'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      {b.city ? `${b.city}, ` : ''}{b.country || 'Ghana'}
                    </span>
                    <span className="font-mono text-neutral-500">
                      {b.customer_slots_used || 0} clients
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-500 font-mono truncate pt-1 border-t border-neutral-900">
                    {b.contact_email || 'No contact email'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security & Multi-Tenant Isolation Notice */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Strict Multi-Tenant Separation Active</div>
            <p className="text-[11px] text-neutral-500">
              Platform operator metrics are aggregated securely. Individual tenant measurement cards and client photo vaults remain private to their respective studio owners.
            </p>
          </div>
        </div>
        <Link
          to="/platform/audit-logs"
          className="text-xs text-neutral-300 hover:text-white font-medium shrink-0 flex items-center gap-1 bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700"
        >
          <History className="w-3.5 h-3.5" />
          <span>View Audit Trail</span>
        </Link>
      </div>
    </div>
  );
};

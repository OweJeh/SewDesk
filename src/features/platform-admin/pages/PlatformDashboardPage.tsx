import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Business, Customer, Order, Payment, Profile, BusinessMember } from '@/types';
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
  UserCheck,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionConfig } from '@/features/subscriptions/services/subscriptionConfig';

export const PlatformDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessMembers, setBusinessMembers] = useState<BusinessMember[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'studios'>('users');

  const isLive = isSupabaseConfigured();

  const loadPlatformData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isLive) {
        const [profRes, bizRes, memRes, custRes, ordRes, payRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('business_members').select('*'),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*').order('created_at', { ascending: false }),
        ]);

        let loadedProfiles: Profile[] = [];
        let loadedBusinesses: Business[] = [];
        let loadedCustomers: Customer[] = [];
        let loadedOrders: Order[] = [];
        let loadedPayments: Payment[] = [];
        let loadedMembers: BusinessMember[] = [];

        if (profRes.data && profRes.data.length > 0) {
          loadedProfiles = profRes.data as Profile[];
          await db.profiles.bulkPut(loadedProfiles);
        } else {
          loadedProfiles = await db.profiles.toArray();
        }

        if (bizRes.data && bizRes.data.length > 0) {
          loadedBusinesses = bizRes.data as Business[];
          await db.businesses.bulkPut(loadedBusinesses);
        } else {
          loadedBusinesses = await db.businesses.toArray();
        }

        if (memRes.data) loadedMembers = memRes.data as BusinessMember[];
        if (custRes.data) loadedCustomers = custRes.data as Customer[];
        if (ordRes.data) loadedOrders = ordRes.data as Order[];
        if (payRes.data) loadedPayments = payRes.data as Payment[];

        setProfiles(loadedProfiles);
        setBusinesses(loadedBusinesses);
        setBusinessMembers(loadedMembers);
        setCustomers(loadedCustomers);
        setOrders(loadedOrders);
        setPayments(loadedPayments);
      } else {
        const [profData, bizData, memData, custData, ordData, payData, mCount] = await Promise.all([
          db.profiles.toArray(),
          db.businesses.toArray(),
          db.businessMembers.toArray(),
          db.customers.toArray(),
          db.orders.toArray(),
          db.payments.toArray(),
          db.measurementSets.count(),
        ]);

        setProfiles(profData);
        setBusinesses(bizData);
        setBusinessMembers(memData);
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
  const subConfig = getSubscriptionConfig();
  const proStudios = businesses.filter((b) => {
    const override = subConfig.studioOverrides[b.id];
    return override?.forceTier === 'pro' || (b.customer_slots_used || 0) > (override?.customCustomerLimit ?? subConfig.freeCustomerLimit);
  });

  // Business ID to Business Name lookup map
  const businessMap = new Map<string, string>();
  businesses.forEach((b) => businessMap.set(b.id, b.business_name));

  // Customer ID to Customer Name lookup map
  const customerMap = new Map<string, string>();
  customers.forEach((c) => customerMap.set(c.id, c.full_name));

  // Owner profile map
  const ownerBizMap = new Map<string, Business>();
  businesses.forEach((b) => {
    if (b.owner_profile_id) ownerBizMap.set(b.owner_profile_id, b);
  });

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
              {isLive ? 'Supabase Live Connected' : 'Dexie IndexedDB'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Realtime tenant telemetry across all registered user accounts, studio workspaces, and workshops.
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
            className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-black font-semibold">Refresh All</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (5 Responsive Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Active Users (Supabase Auth / Profiles) */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Active Users
            </span>
            <div className="p-2 bg-blue-950/60 text-blue-400 border border-blue-900/60 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-bold text-white">
            {profiles.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
            <span>Verified accounts</span>
            <span className="font-mono text-emerald-400 text-[10px]">LIVE AUTH</span>
          </div>
        </div>

        {/* Total Studios */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Studio Tenants
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
            <Link to="/platform/businesses" className="text-neutral-400 hover:text-white flex items-center gap-0.5 font-medium">
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl hover:border-neutral-700 transition-colors">
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
            <span>Across all studios</span>
            <span className="font-mono text-neutral-400">
              {businesses.length ? (customers.length / businesses.length).toFixed(1) : 0} avg
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl hover:border-neutral-700 transition-colors">
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
            <span className="text-blue-400">{activeOrders.length} active</span>
            <span>{orders.filter((o) => o.status === 'delivered').length} delivered</span>
          </div>
        </div>

        {/* Gross Order Volume */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-xl hover:border-neutral-700 transition-colors">
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
            <Link to="/platform/transactions" className="text-neutral-400 hover:text-white flex items-center gap-0.5 font-medium">
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
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Reconciled Payments</div>
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

      {/* Interactive Tabs: User Accounts | Recent Orders | Studios */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col">
        {/* Tab Headers */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Tailor Accounts ({profiles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Cross-Studio Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('studios')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'studios'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Studios ({businesses.length})</span>
            </button>
          </div>

          <Link
            to={activeTab === 'users' ? '/platform/settings' : activeTab === 'orders' ? '/platform/transactions' : '/platform/businesses'}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium"
          >
            <span>Full details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Content: Users Directory */}
        {activeTab === 'users' && (
          <div className="flex-1">
            {profiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No user accounts loaded.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (< md) */}
                <div className="md:hidden divide-y divide-neutral-800/80">
                  {profiles.map((p) => {
                    const ownedBiz = ownerBizMap.get(p.id);
                    const isRoot = p.email.toLowerCase() === 'owusujunior2004@gmail.com';
                    return (
                      <div key={p.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                              <span>{p.full_name || p.email.split('@')[0]}</span>
                              {isRoot && (
                                <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono px-1 py-0">
                                  ROOT
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              {p.email}
                            </div>
                          </div>
                          {isRoot ? (
                            <Badge variant="default" className="bg-red-950 text-red-400 border border-red-800 text-[9px] font-mono">
                              PLATFORM ADMIN
                            </Badge>
                          ) : ownedBiz ? (
                            <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-[9px]">
                              STUDIO OWNER
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-neutral-800 text-neutral-400 text-[9px]">
                              STAFF
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-900">
                          <span>{ownedBiz ? ownedBiz.business_name : 'Staff / Workspace Member'}</span>
                          <span>{formatDate(p.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table (md+) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/60 border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                      <tr>
                        <th className="py-3 px-4">User / Tailor</th>
                        <th className="py-3 px-4">Contact Email</th>
                        <th className="py-3 px-4">Assigned Workspace</th>
                        <th className="py-3 px-4 text-center">Platform Role</th>
                        <th className="py-3 px-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-sans">
                      {profiles.map((p) => {
                        const ownedBiz = ownerBizMap.get(p.id);
                        const isHardLockedAdmin = p.email.toLowerCase() === 'owusujunior2004@gmail.com';
                        return (
                          <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{p.full_name || p.email.split('@')[0]}</span>
                                {isHardLockedAdmin && (
                                  <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono px-1 py-0">
                                    ROOT OPS
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[160px]">
                                {p.id}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-neutral-300 font-mono text-[11px]">
                              {p.email}
                            </td>
                            <td className="py-3 px-4 text-neutral-300">
                              {ownedBiz ? (
                                <span className="font-medium text-white">{ownedBiz.business_name}</span>
                              ) : (
                                <span className="text-neutral-500 italic">Workspace Active / Staff</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isHardLockedAdmin ? (
                                <Badge variant="default" className="bg-red-950 text-red-400 border border-red-800 text-[9px] font-mono">
                                  PLATFORM ADMIN
                                </Badge>
                              ) : ownedBiz ? (
                                <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-[9px]">
                                  STUDIO OWNER
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-neutral-800 text-neutral-400 text-[9px]">
                                  STAFF TAILOR
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right text-neutral-400 font-mono text-[11px]">
                              {formatDate(p.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="flex-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No orders recorded across the platform yet.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (< md) */}
                <div className="md:hidden divide-y divide-neutral-800/80">
                  {orders.slice(0, 8).map((ord) => {
                    const studioName = businessMap.get(ord.business_id) || 'Studio';
                    const clientName = customerMap.get(ord.customer_id) || ord.customer?.full_name || 'Client';
                    return (
                      <div key={ord.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono font-bold text-white text-xs">{ord.order_number}</span>
                            <div className="text-[11px] text-neutral-400">{ord.garment_type}</div>
                          </div>
                          <div>{getStatusBadge(ord.status)}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-neutral-400 truncate max-w-[150px]">{studioName} &bull; {clientName}</span>
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(ord.total_price, ord.currency || 'GHS')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table (md+) */}
                <div className="hidden md:block overflow-x-auto">
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
                      {orders.slice(0, 10).map((ord) => {
                        const studioName = businessMap.get(ord.business_id) || 'Studio';
                        const clientName = customerMap.get(ord.customer_id) || ord.customer?.full_name || 'Client';
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
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab Content: Studios */}
        {activeTab === 'studios' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {businesses.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-neutral-500">
                No studio workspaces provisioned yet.
              </div>
            ) : (
              businesses.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[180px]">
                      {b.business_name}
                    </span>
                    {(() => {
                      const override = subConfig.studioOverrides[b.id];
                      const limit = override?.customCustomerLimit ?? subConfig.freeCustomerLimit;
                      const isPro = override?.forceTier === 'pro' || (b.customer_slots_used || 0) > limit;
                      const isBase = override?.forceTier === 'base';
                      return (
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            isPro
                              ? 'border-emerald-700 text-emerald-400'
                              : isBase
                              ? 'border-amber-700 text-amber-400'
                              : 'border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {isPro ? 'PRO' : isBase ? 'BASE' : 'TRIAL'}
                        </Badge>
                      );
                    })()}
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    {b.city ? `${b.city}, ` : ''}{b.country || 'Ghana'} &bull; <span className="font-mono text-neutral-300">{b.customer_slots_used || 0} clients</span>
                  </div>

                  <div className="text-[10px] text-neutral-500 font-mono truncate pt-1 border-t border-neutral-900">
                    {b.contact_email || 'No email'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Security & Multi-Tenant Isolation Notice */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Multi-Tenant Isolation & Account Directory</div>
            <p className="text-[11px] text-neutral-500">
              Platform operator metrics are synchronized directly from Supabase and Dexie. Tailor customer records remain isolated within each studio's workspace boundary.
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

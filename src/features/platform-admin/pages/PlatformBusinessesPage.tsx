import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Business, Customer, Order, BusinessMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Building2,
  Search,
  SlidersHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

interface BusinessWithMetrics extends Business {
  actualCustomerCount: number;
  orderCount: number;
  totalRevenue: number;
  memberCount: number;
}

export const PlatformBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithMetrics | null>(null);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  const isLive = isSupabaseConfigured();

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      let rawBiz: Business[] = [];
      let allCust: Customer[] = [];
      let allOrders: Order[] = [];
      let allMembers: BusinessMember[] = [];

      if (isLive) {
        const [bizRes, custRes, ordRes, memRes] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('business_members').select('*'),
        ]);

        if (bizRes.data) rawBiz = bizRes.data as Business[];
        if (custRes.data) allCust = custRes.data as Customer[];
        if (ordRes.data) allOrders = ordRes.data as Order[];
        if (memRes.data) allMembers = memRes.data as BusinessMember[];
      } else {
        const [bizData, custData, ordData, memData] = await Promise.all([
          db.businesses.toArray(),
          db.customers.toArray(),
          db.orders.toArray(),
          db.businessMembers.toArray(),
        ]);
        rawBiz = bizData;
        allCust = custData;
        allOrders = ordData;
        allMembers = memData;
      }

      // Compute metrics per business
      const enriched: BusinessWithMetrics[] = rawBiz.map((b) => {
        const bCusts = allCust.filter((c) => c.business_id === b.id);
        const bOrders = allOrders.filter((o) => o.business_id === b.id);
        const bMembers = allMembers.filter((m) => m.business_id === b.id);
        const revenue = bOrders.reduce((acc, ord) => acc + (Number(ord.total_price) || 0), 0);

        return {
          ...b,
          actualCustomerCount: Math.max(bCusts.length, b.customer_slots_used || 0),
          orderCount: bOrders.length,
          totalRevenue: revenue,
          memberCount: Math.max(bMembers.length, 1),
        };
      });

      setBusinesses(enriched);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Filter and Search logic
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const isPro = (b.actualCustomerCount > 100);
      if (filterTier === 'pro' && !isPro) return false;
      if (filterTier === 'free' && isPro) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        b.business_name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.country?.toLowerCase().includes(q) ||
        b.contact_email?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q)
      );
    });
  }, [businesses, filterTier, searchTerm]);

  // Handle granting / revoking Pro tier
  const handleTogglePro = async (biz: BusinessWithMetrics) => {
    setIsUpdatingSub(true);
    try {
      const isCurrentlyPro = biz.actualCustomerCount > 100;
      const newSlots = isCurrentlyPro ? 25 : 150; // Toggles slots count or pro state

      if (isLive) {
        await supabase
          .from('businesses')
          .update({ customer_slots_used: newSlots, updated_at: new Date().toISOString() })
          .eq('id', biz.id);
      } else {
        await db.businesses.update(biz.id, {
          customer_slots_used: newSlots,
          updated_at: new Date().toISOString(),
        });
      }

      await fetchBusinesses();
      if (selectedBusiness?.id === biz.id) {
        setSelectedBusiness((prev) => (prev ? { ...prev, actualCustomerCount: newSlots, customer_slots_used: newSlots } : null));
      }
    } catch (err) {
      console.error('Error toggling Pro tier:', err);
    } finally {
      setIsUpdatingSub(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Registered Businesses
            </h1>
            <Badge variant="default" className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-mono">
              {businesses.length} Tenants
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global studio registry, contact directories, and tenant capacity audits.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBusinesses}
          disabled={isLoading}
          className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search studios by name, city, email, or phone..."
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs h-10 rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({businesses.length})
          </button>
          <button
            onClick={() => setFilterTier('pro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === 'pro'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pro Tier ({businesses.filter((b) => b.actualCustomerCount > 100).length})
          </button>
          <button
            onClick={() => setFilterTier('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTier === 'free'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Free Tier ({businesses.filter((b) => b.actualCustomerCount <= 100).length})
          </button>
        </div>
      </div>

      {/* Mobile Card List (Visible on < md) */}
      <div className="md:hidden space-y-3">
        {filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 text-xs">
            No matching tailoring studios found.
          </div>
        ) : (
          filteredBusinesses.map((b) => {
            const isPro = b.actualCustomerCount > 100;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBusiness(b)}
                className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 active:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{b.business_name}</h3>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span>{b.city ? `${b.city}, ` : ''}{b.country || 'Ghana'}</span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono ${
                      isPro
                        ? 'border-emerald-700 text-emerald-400 bg-emerald-950/40'
                        : 'border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {isPro ? 'PRO UNLIMITED' : 'FREE TIER (100)'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800/80 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Clients</span>
                    <span className="font-mono text-white font-medium">{b.actualCustomerCount}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Orders</span>
                    <span className="font-mono text-white font-medium">{b.orderCount}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">GMV</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {formatCurrency(b.totalRevenue, b.default_currency || 'GHS')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <span className="text-[11px] font-mono text-neutral-500 truncate max-w-[180px]">
                    {b.contact_email}
                  </span>
                  <span className="text-neutral-300 font-medium flex items-center gap-0.5">
                    Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Data Table (Visible on md+) */}
      <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredBusinesses.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-neutral-700" />
              <p>No tailoring studios matching filter criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3.5 px-4">Studio Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Plan Tier</th>
                  <th className="py-3.5 px-4 text-center">Clients</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total GMV</th>
                  <th className="py-3.5 px-4 text-right">Registered</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredBusinesses.map((b) => {
                  const isPro = b.actualCustomerCount > 100;
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-neutral-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedBusiness(b)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{b.business_name}</div>
                        <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[160px]">
                          {b.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">
                        {b.city ? `${b.city}, ` : ''}{b.country || 'Ghana'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-200">{b.contact_email || '—'}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{b.phone || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            isPro
                              ? 'border-emerald-700 text-emerald-400 bg-emerald-950/40'
                              : 'border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {isPro ? 'PRO UNLIMITED' : 'FREE (100)'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-white">
                        {b.actualCustomerCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-neutral-300">
                        {b.orderCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                        {formatCurrency(b.totalRevenue, b.default_currency || 'GHS')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-400 font-mono text-[11px]">
                        {formatDate(b.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBusiness(b)}
                          className="text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 h-8 px-2"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Business Detail Drawer / Modal */}
      {selectedBusiness && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBusiness(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    {selectedBusiness.business_name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono ${
                      selectedBusiness.actualCustomerCount > 100
                        ? 'border-emerald-700 text-emerald-400 bg-emerald-950/40'
                        : 'border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {selectedBusiness.actualCustomerCount > 100 ? 'PRO' : 'FREE TIER'}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Tenant UUID: {selectedBusiness.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Quick Stats */}
            <div className="grid grid-cols-3 gap-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">Clients</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {selectedBusiness.actualCustomerCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">Orders</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {selectedBusiness.orderCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">Gross GMV</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(selectedBusiness.totalRevenue, selectedBusiness.default_currency || 'GHS')}
                </div>
              </div>
            </div>

            {/* Profile & Contact Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Contact Email:</span>
                <span className="font-mono text-white">{selectedBusiness.contact_email || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Phone / WhatsApp:</span>
                <span className="font-mono text-white">{selectedBusiness.phone || selectedBusiness.whatsapp || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Location:</span>
                <span className="text-white">
                  {selectedBusiness.city ? `${selectedBusiness.city}, ` : ''}{selectedBusiness.country || 'Ghana'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Default Currency & Unit:</span>
                <span className="font-mono text-white">
                  {selectedBusiness.default_currency || 'GHS'} &bull; {selectedBusiness.default_measurement_unit || 'cm'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Registration Date:</span>
                <span className="font-mono text-neutral-300">
                  {formatDate(selectedBusiness.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-400">Owner Profile ID:</span>
                <span className="font-mono text-neutral-400 text-[11px] truncate max-w-[240px]">
                  {selectedBusiness.owner_profile_id || 'System'}
                </span>
              </div>
            </div>

            {/* Admin Override Controls */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Platform Operator Overrides
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingSub}
                  onClick={() => handleTogglePro(selectedBusiness)}
                  className="border-neutral-700 text-white hover:bg-neutral-800 text-xs flex-1 gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {selectedBusiness.actualCustomerCount > 100
                      ? 'Revoke Pro Subscription'
                      : 'Grant Pro Subscription'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBusiness(null)}
                  className="border-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

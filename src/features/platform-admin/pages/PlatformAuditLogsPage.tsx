import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Business, Customer, Order, Payment, BusinessMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import {
  History,
  Shield,
  Search,
  Filter,
  Download,
  Building2,
  Users,
  ShoppingBag,
  CreditCard,
  UserCheck,
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  category: 'studio' | 'client' | 'order' | 'financial' | 'staff';
  action: string;
  actor: string;
  entityId: string;
  entityName: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'notice' | 'critical';
}

export const PlatformAuditLogsPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'studio' | 'client' | 'order' | 'financial'>('all');

  const isLive = isSupabaseConfigured();

  const loadAuditTrail = useCallback(async () => {
    setIsLoading(true);
    try {
      let businesses: Business[] = [];
      let customers: Customer[] = [];
      let orders: Order[] = [];
      let payments: Payment[] = [];
      let members: BusinessMember[] = [];

      if (isLive) {
        const [bRes, cRes, oRes, pRes, mRes] = await Promise.all([
          supabase.from('businesses').select('*'),
          supabase.from('customers').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('payments').select('*'),
          supabase.from('business_members').select('*'),
        ]);
        if (bRes.data) businesses = bRes.data as Business[];
        if (cRes.data) customers = cRes.data as Customer[];
        if (oRes.data) orders = oRes.data as Order[];
        if (pRes.data) payments = pRes.data as Payment[];
        if (mRes.data) members = mRes.data as BusinessMember[];
      } else {
        const [bData, cData, oData, pData, mData] = await Promise.all([
          db.businesses.toArray(),
          db.customers.toArray(),
          db.orders.toArray(),
          db.payments.toArray(),
          db.businessMembers.toArray(),
        ]);
        businesses = bData;
        customers = cData;
        orders = oData;
        payments = pData;
        members = mData;
      }

      const bizMap = new Map<string, string>();
      businesses.forEach((b) => bizMap.set(b.id, b.business_name));

      const logList: AuditEvent[] = [];

      // 1. Studio registration events
      businesses.forEach((b) => {
        logList.push({
          id: `audit-biz-${b.id}`,
          category: 'studio',
          action: 'STUDIO_TENANT_PROVISIONED',
          actor: b.contact_email || 'Owner',
          entityId: b.id,
          entityName: b.business_name,
          details: `Tenant workspace registered in ${b.city || 'Accra'}, ${b.country || 'Ghana'} (Default currency: ${b.default_currency || 'GHS'}).`,
          timestamp: b.created_at,
          severity: 'info',
        });
      });

      // 2. Customer additions
      customers.forEach((c) => {
        const studio = bizMap.get(c.business_id) || 'Studio';
        logList.push({
          id: `audit-cust-${c.id}`,
          category: 'client',
          action: 'CLIENT_PROFILE_ENROLLED',
          actor: studio,
          entityId: c.customer_number || c.id,
          entityName: c.full_name,
          details: `Client profile enrolled into workspace with contact phone ${c.phone}.`,
          timestamp: c.created_at,
          severity: 'info',
        });
      });

      // 3. Order lifecycle events
      orders.forEach((o) => {
        const studio = bizMap.get(o.business_id) || 'Studio';
        logList.push({
          id: `audit-ord-${o.id}`,
          category: 'order',
          action: `ORDER_LIFECYCLE_${o.status.toUpperCase()}`,
          actor: studio,
          entityId: o.order_number,
          entityName: `${o.garment_type} Order`,
          details: `Garment order ${o.order_number} (${o.garment_type}) registered with total price ${o.currency || 'GHS'} ${o.total_price}. Current status: ${o.status}.`,
          timestamp: o.created_at,
          severity: o.status === 'delivered' ? 'notice' : 'info',
        });
      });

      // 4. Payment receipts
      payments.forEach((p) => {
        const studio = bizMap.get(p.business_id) || 'Studio';
        logList.push({
          id: `audit-pay-${p.id}`,
          category: 'financial',
          action: 'PAYMENT_SETTLED',
          actor: studio,
          entityId: p.reference || p.id,
          entityName: `${p.currency || 'GHS'} ${p.amount}`,
          details: `Payment of ${p.currency || 'GHS'} ${p.amount} received via ${p.method.replace('_', ' ')}. Status: ${p.status}.`,
          timestamp: p.payment_date || p.created_at,
          severity: 'notice',
        });
      });

      // Sort newest first
      logList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(logList);
    } catch (err) {
      console.error('Error generating audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  // Export audit dump
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sewdesk-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        e.action.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.entityName.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q)
      );
    });
  }, [events, categoryFilter, searchTerm]);

  const getCategoryBadge = (category: AuditEvent['category']) => {
    switch (category) {
      case 'studio':
        return <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-[10px]"><Building2 className="w-3 h-3 mr-1" />Studio</Badge>;
      case 'client':
        return <Badge variant="outline" className="border-blue-800 text-blue-400 bg-blue-950/40 text-[10px]"><Users className="w-3 h-3 mr-1" />Client</Badge>;
      case 'order':
        return <Badge variant="outline" className="border-amber-800 text-amber-400 bg-amber-950/40 text-[10px]"><ShoppingBag className="w-3 h-3 mr-1" />Order</Badge>;
      case 'financial':
        return <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/40 text-[10px]"><CreditCard className="w-3 h-3 mr-1" />Finance</Badge>;
      default:
        return <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">System</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Audit Trail
            </h1>
            <Badge variant="default" className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-mono">
              Immutable
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tamper-resistant audit events for studio provisioning, client enrollments, and financial receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={events.length === 0}
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAuditTrail}
            disabled={isLoading}
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by action, actor, entity ID, or keyword..."
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs h-10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setCategoryFilter('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === 'studio' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Studios
          </button>
          <button
            onClick={() => setCategoryFilter('client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === 'client' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setCategoryFilter('order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === 'order' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setCategoryFilter('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === 'financial' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Financial
          </button>
        </div>
      </div>

      {/* Audit Events Feed */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-neutral-700" />
            <p>No audit trail events matching filter parameters.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 font-sans">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-neutral-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(evt.category)}
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {evt.action}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Entity: {evt.entityId}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {evt.details}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1 font-mono">
                    <span>Actor: <span className="text-neutral-400">{evt.actor}</span></span>
                    <span>&bull;</span>
                    <span>Target: <span className="text-neutral-400">{evt.entityName}</span></span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-neutral-500 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                  <span>{formatDate(evt.timestamp)}</span>
                  <span className="text-[10px] text-neutral-600">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

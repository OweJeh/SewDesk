import React, { useState, useEffect } from 'react';
import { db } from '@/offline/database/dexie-db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  ShieldCheck,
  Database,
  Key,
  HardDrive,
  Download,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Sliders,
  CheckCircle2,
  Server,
  Zap,
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';
import type { Business, Customer, Order, Payment } from '@/types';

export const PlatformSettingsPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [tableCounts, setTableCounts] = useState<{ [table: string]: number }>({});
  const [storageEstimate, setStorageEstimate] = useState<{ usage: string; quota: string }>({ usage: '0 MB', quota: '0 MB' });
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const isLive = isSupabaseConfigured();
  const activeEmail = profile?.email || user?.email || 'owusujunior2004@gmail.com';

  const loadTelemetry = async () => {
    try {
      const [bizCount, custCount, ordCount, payCount, mCount, profCount, memCount] = await Promise.all([
        db.businesses.count(),
        db.customers.count(),
        db.orders.count(),
        db.payments.count(),
        db.measurementSets.count(),
        db.profiles.count(),
        db.businessMembers.count(),
      ]);

      setTableCounts({
        businesses: bizCount,
        customers: custCount,
        orders: ordCount,
        payments: payCount,
        measurementSets: mCount,
        profiles: profCount,
        businessMembers: memCount,
      });

      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usageMB = ((est.usage || 0) / (1024 * 1024)).toFixed(2) + ' MB';
        const quotaMB = ((est.quota || 0) / (1024 * 1024)).toFixed(0) + ' MB';
        setStorageEstimate({ usage: usageMB, quota: quotaMB });
      }
    } catch (err) {
      console.error('Error loading telemetry:', err);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  // Export full JSON dump
  const handleFullBackup = async () => {
    try {
      const backup = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        businesses: await db.businesses.toArray(),
        customers: await db.customers.toArray(),
        orders: await db.orders.toArray(),
        payments: await db.payments.toArray(),
        measurementSets: await db.measurementSets.toArray(),
        profiles: await db.profiles.toArray(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sewdesk-platform-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error backing up database:', err);
    }
  };

  // Seed demo data for rapid testing
  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const now = new Date().toISOString();
      const biz1Id = generateUUID();
      const biz2Id = generateUUID();

      const demoBiz1: Business = {
        id: biz1Id,
        business_name: 'Heritage Bespoke Atelier',
        business_type: 'Bespoke Tailoring',
        owner_profile_id: user?.id || generateUUID(),
        contact_email: 'heritage@bespoke.gh',
        phone: '+233 24 555 1010',
        country: 'Ghana',
        region: 'Greater Accra',
        city: 'Accra',
        default_currency: 'GHS',
        default_measurement_unit: 'cm',
        customer_slots_used: 120, // Pro tier
        created_at: now,
        updated_at: now,
      };

      const demoBiz2: Business = {
        id: biz2Id,
        business_name: 'Golden Thread Couture',
        business_type: 'Fashion Studio',
        owner_profile_id: generateUUID(),
        contact_email: 'goldenthread@accra.fashion',
        phone: '+233 20 888 2020',
        country: 'Ghana',
        region: 'Ashanti',
        city: 'Kumasi',
        default_currency: 'GHS',
        default_measurement_unit: 'inch',
        customer_slots_used: 45, // Free tier
        created_at: now,
        updated_at: now,
      };

      await db.businesses.bulkPut([demoBiz1, demoBiz2]);

      // Seed 2 customers
      const cust1Id = generateUUID();
      const cust2Id = generateUUID();

      const cust1: Customer = {
        id: cust1Id,
        business_id: biz1Id,
        customer_number: 'CUST-0001',
        full_name: 'Dr. Kwame Osei',
        phone: '+233 24 111 2233',
        email: 'kwame.osei@legon.edu.gh',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        total_orders: 2,
        total_spent: 3400,
        outstanding_balance: 600,
      };

      const cust2: Customer = {
        id: cust2Id,
        business_id: biz2Id,
        customer_number: 'CUST-0001',
        full_name: 'Abena Mensah',
        phone: '+233 27 999 8877',
        email: 'abena@mensah.com',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        total_orders: 1,
        total_spent: 1200,
        outstanding_balance: 0,
      };

      await db.customers.bulkPut([cust1, cust2]);

      // Seed 2 orders
      const ord1Id = generateUUID();
      const ord2Id = generateUUID();

      const ord1: Order = {
        id: ord1Id,
        business_id: biz1Id,
        customer_id: cust1Id,
        order_number: 'ORD-0001',
        garment_type: 'Three-Piece Kaftan & Agbada',
        total_price: 3400,
        currency: 'GHS',
        measurement_set_id: generateUUID(),
        status: 'sewing',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        amount_paid: 2800,
        balance: 600,
      };

      const ord2: Order = {
        id: ord2Id,
        business_id: biz2Id,
        customer_id: cust2Id,
        order_number: 'ORD-0001',
        garment_type: 'Kente Formal Gown',
        total_price: 1200,
        currency: 'GHS',
        measurement_set_id: generateUUID(),
        status: 'delivered',
        created_by: 'system',
        created_at: now,
        updated_at: now,
        amount_paid: 1200,
        balance: 0,
      };

      await db.orders.bulkPut([ord1, ord2]);

      // Seed 2 payments
      const pay1: Payment = {
        id: generateUUID(),
        business_id: biz1Id,
        customer_id: cust1Id,
        order_id: ord1Id,
        amount: 2800,
        currency: 'GHS',
        method: 'mobile_money',
        reference: 'MTN-88291039',
        payment_date: now,
        status: 'completed',
        recorded_by: 'system',
        created_at: now,
      };

      const pay2: Payment = {
        id: generateUUID(),
        business_id: biz2Id,
        customer_id: cust2Id,
        order_id: ord2Id,
        amount: 1200,
        currency: 'GHS',
        method: 'cash',
        reference: 'CSH-RECEIPT-01',
        payment_date: now,
        status: 'completed',
        recorded_by: 'system',
        created_at: now,
      };

      await db.payments.bulkPut([pay1, pay2]);

      setSeedSuccess(true);
      await loadTelemetry();
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Settings & System Telemetry
            </h1>
            <Badge variant="default" className="bg-red-600 text-white text-[10px] font-mono">
              ROOT CONFIG
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global system parameters, operator access credentials, database storage metrics, and backups.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadTelemetry}
          className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </Button>
      </div>

      {/* Grid: Operator Info & Database Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operator Credentials Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Authorized Platform Operator</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                Hard-Locked Root Operator Email
              </span>
              <span className="font-mono text-sm text-white font-semibold">
                owusujunior2004@gmail.com
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                Active Session Operator
              </span>
              <span className="font-mono text-xs text-neutral-300">
                {activeEmail}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <span className="text-neutral-400">Security Access Level:</span>
              <Badge variant="default" className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono">
                TIER-1 FULL PRIVILEGE
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">Platform Isolation:</span>
              <span className="text-emerald-400 font-medium">Multi-Tenant Enforced</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-400">Database Driver:</span>
              <span className="font-mono text-neutral-300">
                {isLive ? 'Supabase PostgreSQL (Live)' : 'Dexie IndexedDB (Offline-First)'}
              </span>
            </div>
          </div>
        </div>

        {/* Database & Storage Telemetry */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Storage Telemetry</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-[10px] uppercase text-neutral-500 block">Storage Usage</span>
              <span className="font-mono font-bold text-white text-base mt-0.5 block">
                {storageEstimate.usage}
              </span>
              <span className="text-[10px] text-neutral-500">Quota: {storageEstimate.quota}</span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-[10px] uppercase text-neutral-500 block">Total Studios</span>
              <span className="font-mono font-bold text-white text-base mt-0.5 block">
                {tableCounts.businesses ?? 0}
              </span>
              <span className="text-[10px] text-neutral-500">{tableCounts.profiles ?? 0} user profiles</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/80 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Clients Table:</span>
              <span className="font-mono text-white font-medium">{tableCounts.customers ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Orders Table:</span>
              <span className="font-mono text-white font-medium">{tableCounts.orders ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Payments Table:</span>
              <span className="font-mono text-white font-medium">{tableCounts.payments ?? 0} records</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Measurement Sets:</span>
              <span className="font-mono text-white font-medium">{tableCounts.measurementSets ?? 0} sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Subscription Parameters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Platform Subscription Rules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Standard Tier Fee</span>
            <div className="font-mono font-bold text-lg text-emerald-400">GHS 150.00 / mo</div>
            <p className="text-[11px] text-neutral-400">Flat rate across all West African tailoring studios</p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Free Tier Limit</span>
            <div className="font-mono font-bold text-lg text-white">100 Clients Max</div>
            <p className="text-[11px] text-neutral-400">Strict gate enforced on the 101st client registration</p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Workspace Policy</span>
            <div className="font-mono font-bold text-lg text-white">1 Workspace / Email</div>
            <p className="text-[11px] text-neutral-400">Enforced by backend tenant registration gate</p>
          </div>
        </div>
      </div>

      {/* Platform Maintenance & Developer Data Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Server className="w-5 h-5 text-neutral-300" />
          <h2 className="text-sm font-bold text-white">Platform Operations & Backup</h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Administrative backup tools allow the platform operator to download a complete tamper-resistant JSON snapshot of all tenant workspaces or populate realistic sample studio data for testing.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullBackup}
            className="border-neutral-700 text-white hover:bg-neutral-800 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Platform Backup (JSON)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSeeding}
            onClick={handleSeedDemoData}
            className="border-neutral-700 text-amber-400 hover:bg-neutral-800 text-xs gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSeeding ? 'Seeding...' : 'Seed Sample Studio Data'}</span>
          </Button>
        </div>

        {seedSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sample tailoring studios, clients, orders, and payments seeded successfully!</span>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-neutral-500 pt-4">
        SewDesk Platform Engine &bull; Designed and built by <span className="text-neutral-300 font-semibold">Dev_OJ</span>
      </div>
    </div>
  );
};

// ==============================================================================
// SEWDESK — WORKSHOP REPORTS & STUDIO ANALYTICS
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { orderService, type OrderWithDetails } from '@/features/orders/services/orderService';
import { paymentService, type PaymentWithDetails } from '@/features/payments/services/paymentService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  DollarSign,
  Scissors,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

export const ReportsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const currency = currentBusiness?.default_currency || 'GHS';

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);

    Promise.all([
      orderService.getOrders(currentBusiness.id),
      paymentService.getPayments(currentBusiness.id),
    ]).then(([ords, pays]) => {
      setOrders(ords);
      setPayments(pays);
      setLoading(false);
    });
  }, [currentBusiness?.id]);

  // Financial Metrics
  const totalContractValue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstandingReceivables = Math.max(0, totalContractValue - totalRevenue);
  const avgOrderValue = orders.length > 0 ? totalContractValue / orders.length : 0;

  // Stages breakdown
  const stageCounts: Record<OrderStatus, number> = {
    not_started: orders.filter((o) => o.status === 'not_started').length,
    cutting: orders.filter((o) => o.status === 'cutting').length,
    sewing: orders.filter((o) => o.status === 'sewing').length,
    fitting: orders.filter((o) => o.status === 'fitting').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  // Garment Types distribution
  const garmentTypeMap = new Map<string, { count: number; totalRevenue: number }>();
  orders.forEach((o) => {
    const key = o.garment_type || 'Custom Garment';
    const existing = garmentTypeMap.get(key) || { count: 0, totalRevenue: 0 };
    garmentTypeMap.set(key, {
      count: existing.count + 1,
      totalRevenue: existing.totalRevenue + Number(o.total_price || 0),
    });
  });

  const garmentBreakdown = Array.from(garmentTypeMap.entries()).sort(
    (a, b) => b[1].totalRevenue - a[1].totalRevenue
  );

  // CSV Export handler
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = ['Order Number', 'Client Name', 'Garment Type', 'Status', 'Total Price', 'Paid', 'Balance', 'Due Date'];
    const rows = orders.map((o) => [
      o.order_number,
      `"${o.customer?.full_name || 'Client'}"`,
      `"${o.garment_type}"`,
      o.status,
      o.total_price,
      o.amount_paid,
      o.balance,
      o.due_date || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SewDesk_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Studio Analytics & Reports</h1>
            <Badge variant="outline" className="text-[10px]">
              Studio Scoped
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Authoritative production and financial intelligence for <strong>{currentBusiness?.business_name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Orders CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#777777]">Total Contract Value</span>
          <div className="text-2xl font-bold font-mono text-black mt-1">
            {formatCurrency(totalContractValue, currency)}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">{orders.length} orders booked</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#777777]">Revenue Collected</span>
          <div className="text-2xl font-bold font-mono text-black mt-1">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            {totalContractValue > 0
              ? `${Math.round((totalRevenue / totalContractValue) * 100)}% realized`
              : '0% realized'}
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#777777]">Outstanding Receivables</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${outstandingReceivables > 0 ? 'text-amber-600' : 'text-black'}`}>
            {formatCurrency(outstandingReceivables, currency)}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Pending upon fitting / delivery</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#777777]">Average Order Value</span>
          <div className="text-2xl font-bold font-mono text-black mt-1">
            {formatCurrency(avgOrderValue, currency)}
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Per bespoke garment</p>
        </div>
      </div>

      {/* Production Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stages Distribution */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-black" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Orders by Workshop Stage
              </h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">{orders.length} Total</span>
          </div>

          <CardContent className="p-5 space-y-3">
            {[
              { stage: 'not_started', label: 'Not Started / Queue', count: stageCounts.not_started },
              { stage: 'cutting', label: 'Cutting on Bench', count: stageCounts.cutting },
              { stage: 'sewing', label: 'Sewing / Tailoring', count: stageCounts.sewing },
              { stage: 'fitting', label: 'Fitting with Client', count: stageCounts.fitting },
              { stage: 'ready', label: 'Ready for Collection', count: stageCounts.ready },
              { stage: 'delivered', label: 'Delivered / Completed', count: stageCounts.delivered },
            ].map((item) => {
              const percent = orders.length > 0 ? Math.round((item.count / orders.length) * 100) : 0;
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-black">{item.label}</span>
                    <span className="font-mono text-neutral-600">
                      {item.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Garments Breakdown */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-black" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                Garment Revenue by Category
              </h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">{garmentBreakdown.length} Categories</span>
          </div>

          <CardContent className="p-5">
            {garmentBreakdown.length === 0 ? (
              <div className="text-xs text-neutral-400 py-10 text-center">
                No orders recorded yet to calculate garment breakdown.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E5]">
                {garmentBreakdown.map(([type, stats]) => (
                  <div key={type} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div>
                      <div className="font-bold text-black">{type}</div>
                      <div className="text-[11px] text-[#777777]">{stats.count} garments ordered</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-black">
                        {formatCurrency(stats.totalRevenue, currency)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {totalContractValue > 0
                          ? `${Math.round((stats.totalRevenue / totalContractValue) * 100)}% of revenue`
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

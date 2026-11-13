// ==============================================================================
// SEWDESK — WORKSHOP ORDERS PIPELINE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { orderService, type OrderWithDetails } from '@/features/orders/services/orderService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Scissors,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useCurrentBusiness();
  const currency = currentBusiness?.default_currency || 'GHS';

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = async () => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    const data = await orderService.getOrders(currentBusiness.id);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [currentBusiness?.id]);

  const stages: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Not Started', value: 'not_started' },
    { label: 'Cutting', value: 'cutting' },
    { label: 'Sewing', value: 'sewing' },
    { label: 'Fitting', value: 'fitting' },
    { label: 'Ready', value: 'ready' },
    { label: 'Delivered', value: 'delivered' },
  ];

  // Counts per status
  const counts: Record<string, number> = {
    all: orders.length,
    not_started: orders.filter((o) => o.status === 'not_started').length,
    cutting: orders.filter((o) => o.status === 'cutting').length,
    sewing: orders.filter((o) => o.status === 'sewing').length,
    fitting: orders.filter((o) => o.status === 'fitting').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = filterStatus === 'all' || ord.status === filterStatus;
    const matchesSearch =
      ord.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.customer?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.garment_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.fabric || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.style || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadgeVariant = (st: OrderStatus) => {
    switch (st) {
      case 'not_started':
        return 'secondary';
      case 'cutting':
      case 'sewing':
        return 'warning';
      case 'fitting':
        return 'outline';
      case 'ready':
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Workshop Production Pipeline</h1>
            <Badge variant="outline" className="text-[10px]">
              {orders.length} Total Orders
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Oversee bespoke garments across fabric cutting, stitching, fitting, and collection.
          </p>
        </div>

        <Link to="/app/orders/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Filter Strip & Search */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-3">
        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5E5E5] pb-3">
          {stages.map((s) => {
            const count = counts[s.value] || 0;
            const isSelected = filterStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-black text-white font-semibold shadow-sm'
                    : 'bg-[#FAFAFA] text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E5E5E5] text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by number (ORD-0001), client name, garment type, fabric..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Orders List / Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Loading workshop pipeline...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">No orders found</h3>
            <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No orders match your search criteria. Try a different search term.'
                : 'Get started by creating your first garment order linked to a client measurement session.'}
            </p>
          </div>
          <Link to="/app/orders/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create First Order
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const paidPercent =
              ord.total_price > 0
                ? Math.min(100, Math.round((ord.amount_paid / ord.total_price) * 100))
                : 100;

            const isDueSoon = ord.due_date
              ? new Date(ord.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 &&
                ord.status !== 'delivered' &&
                ord.status !== 'cancelled'
              : false;

            return (
              <Card
                key={ord.id}
                className="border-[#E5E5E5] hover:border-black transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => navigate(`/app/orders/${ord.id}`)}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-black group-hover:underline">
                        {ord.order_number}
                      </span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(ord.status)} className="capitalize text-[10px]">
                      {ord.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="text-sm font-bold text-black truncate">
                        {ord.customer?.full_name || 'Walk-in Client'}
                      </div>
                      <div className="text-xs text-[#777777] mt-0.5 truncate">
                        {ord.garment_type} {ord.style ? `• ${ord.style}` : ''}
                      </div>
                    </div>

                    {ord.fabric && (
                      <div className="text-[11px] text-neutral-600 truncate bg-[#F5F5F5] px-2 py-1 rounded">
                        Fabric: {ord.fabric} {ord.colour ? `(${ord.colour})` : ''}
                      </div>
                    )}

                    {/* Due Date Indicator */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due Date:
                      </span>
                      <span
                        className={`font-semibold ${
                          isDueSoon ? 'text-red-600 font-bold flex items-center gap-1' : 'text-black'
                        }`}
                      >
                        {isDueSoon && <AlertCircle className="w-3 h-3 text-red-600" />}
                        {ord.due_date ? formatDate(ord.due_date) : 'Flexible'}
                      </span>
                    </div>

                    {/* Financial Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#777777]">
                          Paid: {formatCurrency(ord.amount_paid, currency)}
                        </span>
                        <span className="font-bold text-black">
                          {formatCurrency(ord.total_price, currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            paidPercent === 100 ? 'bg-black' : 'bg-neutral-800'
                          }`}
                          style={{ width: `${paidPercent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer */}
                <div className="p-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between text-xs text-neutral-600 group-hover:text-black">
                  <span>View Cutting & Order Sheet</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

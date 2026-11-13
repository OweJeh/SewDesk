// ==============================================================================
// SEWDESK — FINANCIAL LEDGER & PAYMENTS
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { paymentService, type PaymentWithDetails } from '@/features/payments/services/paymentService';
import { orderService, type OrderWithDetails } from '@/features/orders/services/orderService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  CreditCard,
  Plus,
  Search,
  Receipt,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { PaymentMethod } from '@/types';

export const PaymentsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const currency = currentBusiness?.default_currency || 'GHS';

  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('mobile_money');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Receipt Preview Modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentWithDetails | null>(null);

  const loadData = async () => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    const [pays, ords] = await Promise.all([
      paymentService.getPayments(currentBusiness.id),
      orderService.getOrders(currentBusiness.id),
    ]);
    setPayments(pays);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentBusiness?.id]);

  // Aggregate Metrics
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalContractValue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOutstanding = Math.max(0, totalContractValue - totalRevenue);

  // Orders with balance pending
  const ordersWithBalance = orders.filter((o) => o.balance > 0);

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = filterMethod === 'all' || p.method === filterMethod;
    const matchesSearch =
      (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customer?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.order?.order_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness?.id || !selectedOrderId || amount <= 0) return;

    const ord = orders.find((o) => o.id === selectedOrderId);
    if (!ord) return;

    setSubmitting(true);
    try {
      await paymentService.recordPayment({
        business_id: currentBusiness.id,
        customer_id: ord.customer_id,
        order_id: ord.id,
        amount: Number(amount),
        currency,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        recorded_by: user?.id || 'staff',
      });

      setIsModalOpen(false);
      setSelectedOrderId('');
      setAmount(0);
      setReference('');
      setNotes('');
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrderObj = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Financial Ledger & Receipts</h1>
            <Badge variant="outline" className="text-[10px]">
              {payments.length} Transactions
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Track customer deposits, progress installments, and generate printable receipts.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            if (ordersWithBalance.length > 0) {
              setSelectedOrderId(ordersWithBalance[0].id);
              setAmount(ordersWithBalance[0].balance);
            }
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Payment
        </Button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Total Revenue Collected
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-black">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Realized payments in Cash / MoMo / Bank</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Outstanding Receivables
          </span>
          <div className={`mt-1 text-2xl font-bold font-mono ${totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(totalOutstanding, currency)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Pending balance collection on active orders</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
            Total Contracted Order Value
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-black">
            {formatCurrency(totalContractValue, currency)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across {orders.length} workshop orders</p>
        </div>
      </div>

      {/* Filter Strip & Search */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5E5E5] pb-3">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'mobile_money', label: 'Mobile Money' },
            { id: 'cash', label: 'Cash' },
            { id: 'bank_transfer', label: 'Bank Transfer' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterMethod === m.id
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'bg-[#FAFAFA] text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by reference (REC-123456), client name, or order number..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Payments Ledger Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Loading financial ledger...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">No transactions recorded</h3>
            <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
              Payments, deposits, and installments collected for customer orders will appear here.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record First Payment
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-bold text-neutral-500 uppercase">
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">
                      {p.reference || `REC-${p.id.slice(0, 8)}`}
                    </td>
                    <td className="py-3 px-4 font-semibold text-black">
                      {p.customer?.full_name || 'Walk-in Client'}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {p.order?.order_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <Badge variant="outline" className="text-[10px]">
                        {p.method.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-black">
                      {formatCurrency(p.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-black transition-colors"
                        title="View & Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Payment"
        description="Select an active order to log a deposit or final payment installment."
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
              Select Garment Order *
            </label>
            {orders.length === 0 ? (
              <p className="text-xs text-neutral-400">No orders created yet.</p>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord) setAmount(ord.balance);
                }}
                className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs text-[#111111] focus:border-black focus:outline-none"
                required
              >
                <option value="">-- Choose an order --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} — {o.customer?.full_name || 'Client'} ({o.garment_type}) • Balance Due:{' '}
                    {formatCurrency(o.balance, currency)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedOrderObj && (
            <div className="p-3 bg-[#F5F5F5] rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#777777]">Total Order Price:</span>
                <span className="font-bold text-black">{formatCurrency(selectedOrderObj.total_price, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Remaining Balance:</span>
                <span className="font-bold text-amber-600">{formatCurrency(selectedOrderObj.balance, currency)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Amount (${currency}) *`}
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-xs text-[#111111] focus:border-black focus:outline-none"
              >
                <option value="mobile_money">Mobile Money (MTN / Telecel)</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Input
            label="Transaction Reference / Note (Optional)"
            placeholder="e.g. MoMo Transaction ID or receipt number"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !selectedOrderId || amount <= 0}
            >
              {submitting ? 'Recording...' : 'Confirm & Save Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title="Payment Receipt"
          description="Official proof of payment for studio accounts."
        >
          <div className="space-y-4 print:p-0">
            {/* Printable Receipt Sheet */}
            <div className="p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div>
                  <h3 className="text-base font-black text-black">
                    {currentBusiness?.business_name || 'SEWDESK TAILORING STUDIO'}
                  </h3>
                  <p className="text-[10px] text-[#777777] uppercase tracking-wider">
                    Official Payment Receipt
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-black block">
                    {selectedReceipt.reference || `REC-${selectedReceipt.id.slice(0, 8)}`}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatDate(selectedReceipt.payment_date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#777777] uppercase font-semibold block">Client</span>
                  <span className="font-bold text-black">{selectedReceipt.customer?.full_name || 'Walk-in Client'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] uppercase font-semibold block">Order Reference</span>
                  <span className="font-mono font-bold text-black">{selectedReceipt.order?.order_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] uppercase font-semibold block">Payment Method</span>
                  <span className="font-semibold text-black capitalize">{selectedReceipt.method.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] uppercase font-semibold block">Status</span>
                  <span className="font-bold text-emerald-600 uppercase text-[10px]">Payment Confirmed</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black">Amount Received</span>
                <span className="text-xl font-black font-mono text-black">
                  {formatCurrency(selectedReceipt.amount, currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

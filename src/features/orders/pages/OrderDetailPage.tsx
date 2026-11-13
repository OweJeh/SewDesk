// ==============================================================================
// SEWDESK — ORDER DETAIL & WORKSHOP PRODUCTION CONTROL CENTER
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { orderService, type OrderWithDetails } from '@/features/orders/services/orderService';
import { measurementService } from '@/features/measurements/services/measurementService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import {
  Scissors,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Ruler,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { OrderStatus, PaymentMethod, MeasurementUnit } from '@/types';

const PIPELINE_STAGES: { status: OrderStatus; label: string; step: number }[] = [
  { status: 'not_started', label: 'Not Started', step: 1 },
  { status: 'cutting', label: 'Cutting', step: 2 },
  { status: 'sewing', label: 'Sewing', step: 3 },
  { status: 'fitting', label: 'Fitting', step: 4 },
  { status: 'ready', label: 'Ready for Pickup', step: 5 },
  { status: 'delivered', label: 'Delivered', step: 6 },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const currency = currentBusiness?.default_currency || 'GHS';

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState<MeasurementUnit>('cm');

  // Status transition modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('cutting');
  const [transitionNote, setTransitionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    const data = await orderService.getOrderById(id);
    setOrder(data);
    if (data) {
      setPaymentAmount(data.balance);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-black">Order Not Found</h2>
          <p className="text-xs text-[#777777] mt-1">
            This order may have been deleted or does not exist in this workspace.
          </p>
        </div>
        <Link to="/app/orders">
          <Button size="sm" variant="outline">
            Return to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const currentStepObj = PIPELINE_STAGES.find((s) => s.status === order.status);
  const currentStepNum = currentStepObj ? currentStepObj.step : 1;

  const handleAdvanceStatus = async () => {
    if (!order) return;
    setUpdatingStatus(true);
    await orderService.updateOrderStatus(
      order.id,
      targetStatus,
      transitionNote.trim() || undefined,
      user?.id || 'staff'
    );
    setIsStatusModalOpen(false);
    setTransitionNote('');
    setUpdatingStatus(false);
    loadOrder();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || paymentAmount <= 0) return;
    setRecordingPayment(true);

    try {
      // In this version, payment is appended to order and database
      const now = new Date().toISOString();
      const newPayment = {
        id: crypto.randomUUID(),
        business_id: order.business_id,
        customer_id: order.customer_id,
        order_id: order.id,
        amount: Number(paymentAmount),
        currency,
        method: paymentMethod,
        reference: paymentRef.trim() || `REC-${Date.now().toString().slice(-6)}`,
        payment_date: now.split('T')[0],
        status: 'completed' as const,
        notes: paymentNote.trim() || null,
        recorded_by: user?.id || 'staff',
        created_at: now,
      };

      // Push to order
      const updatedPayments = [...(order.payments || []), newPayment];
      const amount_paid = updatedPayments.reduce((s, p) => s + p.amount, 0);
      const balance = Math.max(0, order.total_price - amount_paid);

      setOrder({
        ...order,
        payments: updatedPayments,
        amount_paid,
        balance,
      });

      setIsPaymentModalOpen(false);
      setPaymentNote('');
      setPaymentRef('');
    } finally {
      setRecordingPayment(false);
    }
  };

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Bar / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/app/orders"
            className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-black">{order.order_number}</h1>
              <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-[#777777] mt-0.5">
              Client: <span className="font-semibold text-black">{order.customer?.full_name || 'Walk-in'}</span> •
              Created {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Cutting Sheet
          </Button>
          {order.balance > 0 && (
            <Button
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Production Stage Stepper Bar (Interactive) */}
      <Card className="border-[#E5E5E5] print:hidden">
        <CardContent className="p-4">
          <div className="text-[11px] font-bold text-black uppercase tracking-wider mb-3">
            Production Stage Progression
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {PIPELINE_STAGES.map((stage) => {
              const isCurrent = order.status === stage.status;
              const isPassed = currentStepNum > stage.step;

              return (
                <button
                  key={stage.status}
                  onClick={() => {
                    setTargetStatus(stage.status);
                    setIsStatusModalOpen(true);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'border-black bg-black text-white shadow-sm font-bold'
                      : isPassed
                      ? 'border-[#E5E5E5] bg-[#F5F5F5] text-neutral-800'
                      : 'border-[#E5E5E5] bg-white text-neutral-500 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-semibold mb-1 opacity-70">
                    <span>Stage {stage.step}</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-white animate-pulse" />}
                  </div>
                  <div className="text-xs truncate">{stage.label}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Details & Right Financial / Measurement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Garment Specifications Card */}
          <Card className="border-[#E5E5E5]">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-black" />
                <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                  Garment & Workshop Specifications
                </h2>
              </div>
              <Badge variant="outline" className="text-xs">
                {order.garment_type}
              </Badge>
            </div>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Garment Style</div>
                  <div className="font-bold text-black mt-0.5">{order.style || 'Custom Bespoke'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Fabric Material</div>
                  <div className="font-bold text-black mt-0.5">{order.fabric || 'Client Provided'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Colour / Pattern</div>
                  <div className="font-bold text-black mt-0.5">{order.colour || 'Solid'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Promised Delivery Date</div>
                  <div className="font-bold text-black mt-0.5">
                    {order.due_date ? formatDate(order.due_date) : 'Flexible'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Assigned Tailor</div>
                  <div className="font-bold text-black mt-0.5">{order.assigned_to || 'Lead Workshop Cutter'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase font-semibold">Order Created</div>
                  <div className="font-bold text-black mt-0.5">{formatDate(order.created_at)}</div>
                </div>
              </div>

              {order.description && (
                <div className="pt-3 border-t border-[#E5E5E5]">
                  <div className="text-[10px] text-[#777777] uppercase font-semibold mb-1">
                    Workshop & Styling Instructions
                  </div>
                  <p className="text-xs text-neutral-800 bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E5E5]">
                    {order.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attached Verified Measurement Profile Card */}
          <Card className="border-[#E5E5E5]">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-black" />
                <div>
                  <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                    Cutting Bench Measurements
                  </h2>
                  <div className="text-[10px] text-[#777777]">
                    Session: {order.measurement_set?.session_name || 'Standard Body Profile'} • Verified & Immutable
                  </div>
                </div>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-lg border border-[#E5E5E5] text-[11px]">
                <button
                  onClick={() => setDisplayUnit('cm')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    displayUnit === 'cm' ? 'bg-black text-white font-bold' : 'text-neutral-600'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setDisplayUnit('inch')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    displayUnit === 'inch' ? 'bg-black text-white font-bold' : 'text-neutral-600'
                  }`}
                >
                  INCH
                </button>
              </div>
            </div>

            <CardContent className="p-5">
              {!order.measurement_set?.values || order.measurement_set.values.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  No individual measurement values found on this session.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {order.measurement_set.values.map((v) => {
                    const displayVal =
                      displayUnit === 'cm'
                        ? v.canonical_cm_value
                        : +(v.canonical_cm_value / 2.54).toFixed(1);

                    return (
                      <div
                        key={v.id}
                        className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg flex items-center justify-between"
                      >
                        <span className="text-xs text-neutral-600 truncate">{v.field_name}</span>
                        <span className="text-sm font-black text-black">
                          {displayVal}
                          <span className="text-[10px] font-normal text-neutral-400 ml-0.5">
                            {displayUnit}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {order.measurement_set?.fit_notes && (
                <div className="mt-4 p-3 bg-[#F5F5F5] rounded-lg text-xs text-[#777777] border border-[#E5E5E5]">
                  <span className="font-semibold text-black">Fit Notes:</span> {order.measurement_set.fit_notes}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History Timeline */}
          <Card className="border-[#E5E5E5] print:hidden">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-2">
              <Clock className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                Production Audit Trail
              </h2>
            </div>

            <CardContent className="p-5">
              {(!order.status_history || order.status_history.length === 0) ? (
                <div className="text-xs text-neutral-400 py-4 text-center">No status changes recorded.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5E5E5]">
                  {order.status_history.map((hist) => (
                    <div key={hist.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-black rounded-full border-2 border-white ring-1 ring-black" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black capitalize">
                            {hist.new_status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {formatDate(hist.created_at)}
                          </span>
                        </div>
                        {hist.note && <p className="text-xs text-neutral-600 mt-0.5">{hist.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider">Client Contact</h2>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-sm font-bold text-black">
                  {order.customer?.full_name || 'Walk-in Client'}
                </div>
                <div className="text-xs text-[#777777]">{order.customer?.customer_number}</div>
              </div>

              {order.customer?.phone && (
                <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Phone:</span>
                    <a href={`tel:${order.customer.phone}`} className="font-semibold text-black hover:underline">
                      {order.customer.phone}
                    </a>
                  </div>
                  {order.customer.whatsapp && (
                    <a
                      href={`https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-semibold rounded-lg text-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Ledger Card */}
          <Card className="border-[#E5E5E5]">
            <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider">Financial Ledger</h2>
              <Badge variant={order.balance === 0 ? 'success' : 'warning'}>
                {order.balance === 0 ? 'Settled' : 'Balance Due'}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Agreed Order Total</span>
                  <span className="font-bold text-black">{formatCurrency(order.total_price, currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Total Payments Received</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(order.amount_paid, currency)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E5E5] flex justify-between text-sm">
                  <span className="font-bold text-black">Remaining Balance</span>
                  <span className={`font-black ${order.balance > 0 ? 'text-amber-600' : 'text-black'}`}>
                    {formatCurrency(order.balance, currency)}
                  </span>
                </div>
              </div>

              {/* Payments History */}
              <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
                <div className="text-[10px] text-[#777777] uppercase font-bold">Payments Recorded</div>
                {!order.payments || order.payments.length === 0 ? (
                  <div className="text-xs text-neutral-400 py-1">No payments recorded yet.</div>
                ) : (
                  order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-black capitalize">
                          {p.method.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-[#777777]">{p.reference || formatDate(p.payment_date)}</div>
                      </div>
                      <span className="font-bold text-black">
                        {formatCurrency(p.amount, currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {order.balance > 0 && (
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Record Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advance Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Advance Workshop Production Stage"
        description={`Transition ${order.order_number} to ${targetStatus.replace('_', ' ').toUpperCase()}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
              Select Production Stage
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.status}
                  type="button"
                  onClick={() => setTargetStatus(s.status)}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    targetStatus === s.status
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-[#E5E5E5] bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
              Workshop Transition Note (Optional)
            </label>
            <textarea
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              rows={3}
              placeholder="e.g. Fitting conducted with Nana. Waist adjusted by -1cm. Ready for final hem stitch."
              className="w-full text-xs p-3 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdvanceStatus} disabled={updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Confirm Stage Change'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Payment"
        description={`Add payment toward ${order.order_number}. Current balance: ${formatCurrency(order.balance, currency)}.`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label={`Payment Amount (${currency}) *`}
            type="number"
            step="0.01"
            min="0.01"
            max={order.balance}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mobile_money', label: 'Mobile Money' },
                { id: 'cash', label: 'Cash' },
                { id: 'bank_transfer', label: 'Bank Transfer' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                    paymentMethod === m.id
                      ? 'border-black bg-black text-white font-bold'
                      : 'border-[#E5E5E5] bg-white text-neutral-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Transaction Reference / Receipt #"
            placeholder="e.g. MoMo Transaction ID or receipt note"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={recordingPayment}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={recordingPayment || paymentAmount <= 0}>
              {recordingPayment ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

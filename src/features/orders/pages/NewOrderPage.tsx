// ==============================================================================
// SEWDESK — NEW ORDER CREATION PAGE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { customerService } from '@/features/customers/services/customerService';
import { measurementService } from '@/features/measurements/services/measurementService';
import { orderService } from '@/features/orders/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Scissors,
  ArrowLeft,
  User,
  Ruler,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { Customer, MeasurementSet } from '@/types';

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  const preselectedMeasurementSetId = searchParams.get('measurementSetId');

  const { currentBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const currency = currentBusiness?.default_currency || 'GHS';

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [measurementSets, setMeasurementSets] = useState<MeasurementSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>(preselectedMeasurementSetId || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [garmentType, setGarmentType] = useState('Bespoke Suit');
  const [style, setStyle] = useState('');
  const [fabric, setFabric] = useState('');
  const [colour, setColour] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(1200);
  const [initialDeposit, setInitialDeposit] = useState<number>(600);
  const [depositMethod, setDepositMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('mobile_money');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks default
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Load customers
  useEffect(() => {
    if (!currentBusiness?.id) return;
    setLoading(true);
    customerService.getCustomers(currentBusiness.id).then((custs) => {
      setCustomers(custs);
      setLoading(false);
    });
  }, [currentBusiness?.id]);

  // Load customer's measurement sets when customer is selected
  useEffect(() => {
    if (!selectedCustomerId) {
      setMeasurementSets([]);
      setSelectedSetId('');
      return;
    }

    measurementService.getCustomerMeasurementSets(selectedCustomerId).then((sets) => {
      setMeasurementSets(sets);
      if (sets.length > 0 && !selectedSetId) {
        setSelectedSetId(sets[0].id);
      }
    });
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedMeasurementSet = measurementSets.find((s) => s.id === selectedSetId);

  // Filtered customer list for search
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.customer_number.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentBusiness?.id) {
      setErrorMessage('No active business workspace selected.');
      return;
    }

    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer for this order.');
      return;
    }

    if (!selectedSetId) {
      setErrorMessage(
        'A measurement session must be attached to every order. Please select or record a measurement session first.'
      );
      return;
    }

    if (!garmentType.trim()) {
      setErrorMessage('Please enter a garment type.');
      return;
    }

    if (totalPrice <= 0) {
      setErrorMessage('Total price must be greater than zero.');
      return;
    }

    setSubmitting(true);

    try {
      const { order, error } = await orderService.createOrder({
        business_id: currentBusiness.id,
        customer_id: selectedCustomerId,
        measurement_set_id: selectedSetId,
        garment_type: garmentType.trim(),
        style: style.trim() || undefined,
        fabric: fabric.trim() || undefined,
        colour: colour.trim() || undefined,
        description: description.trim() || undefined,
        total_price: Number(totalPrice),
        currency,
        due_date: dueDate || null,
        notes: notes.trim() || undefined,
        created_by: user?.id || 'studio-owner',
        initial_deposit: Number(initialDeposit) || 0,
        deposit_payment_method: depositMethod,
      });

      if (error || !order) {
        throw error || new Error('Failed to create order.');
      }

      // Record activity on customer
      await customerService.recordCustomerActivity({
        business_id: currentBusiness.id,
        customer_id: selectedCustomerId,
        activity_type: 'order_created',
        description: `Order ${order.order_number} (${garmentType}) created. Agreed price: ${formatCurrency(totalPrice, currency)}.`,
        created_by: user?.id || 'studio-owner',
      });

      navigate(`/app/orders/${order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create order.');
      setSubmitting(false);
    }
  };

  const balance = Math.max(0, (Number(totalPrice) || 0) - (Number(initialDeposit) || 0));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/app/orders"
            className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">New Workshop Order</h1>
            <p className="text-xs text-[#777777]">
              Generate a production work order linked to verified client measurements.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Selection */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                1. Select Customer
              </h2>
            </div>
            {selectedCustomer && (
              <Badge variant="outline" className="text-xs">
                {selectedCustomer.customer_number}
              </Badge>
            )}
          </div>

          <CardContent className="p-5 space-y-4">
            {!selectedCustomerId ? (
              <div className="space-y-3">
                <Input
                  label="Search Customers"
                  placeholder="Type name, phone number, or CUST ID..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />

                <div className="max-h-56 overflow-y-auto border border-[#E5E5E5] rounded-lg divide-y divide-[#E5E5E5]">
                  {loading ? (
                    <div className="p-4 text-center text-xs text-neutral-400">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500 space-y-2">
                      <p>No customers match your search.</p>
                      <Link to="/app/customers/new">
                        <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                          Register New Customer
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="p-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-black">{c.full_name}</div>
                          <div className="text-[11px] text-[#777777]">
                            {c.phone} • {c.customer_number}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          Select
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F5F5F5] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-black">{selectedCustomer?.full_name}</div>
                  <div className="text-xs text-[#777777]">
                    {selectedCustomer?.phone} • {selectedCustomer?.location || 'Accra'}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomerId('');
                    setSelectedSetId('');
                  }}
                >
                  Change Customer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Measurement Session Selection */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                2. Attach Verified Measurement Profile
              </h2>
            </div>
            <span className="text-[11px] text-[#777777]">Immutable session for cutting bench</span>
          </div>

          <CardContent className="p-5 space-y-4">
            {!selectedCustomerId ? (
              <div className="text-xs text-neutral-400 py-3 text-center">
                Select a customer above to view their recorded measurement sessions.
              </div>
            ) : measurementSets.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#E5E5E5] rounded-xl space-y-3">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-black">No measurement sessions found</p>
                  <p className="text-[11px] text-[#777777] mt-0.5">
                    SewDesk enforces that every order is built from verified body measurements.
                  </p>
                </div>
                <Link to={`/app/measurements/new?customerId=${selectedCustomerId}`}>
                  <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Record Measurement Session Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {measurementSets.map((s) => {
                  const isSelected = s.id === selectedSetId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSetId(s.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-[#E5E5E5] bg-white hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                          {s.session_name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`text-[11px] ${isSelected ? 'text-neutral-300' : 'text-[#777777]'}`}>
                        Garment: {s.garment_type}
                      </div>
                      <div className={`text-[10px] mt-1 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Recorded {formatDate(s.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Garment & Fabric Specifications */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-2">
            <Scissors className="w-4 h-4 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              3. Garment Specifications
            </h2>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Garment Type *"
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                placeholder="e.g. 3-Piece Bespoke Suit, Senator Kaftan, Kaba & Slit"
                required
              />
              <Input
                label="Design Style / Cut"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Slim-fit, Double-breasted, Mandarin collar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fabric Material"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Super 150s Wool, Vlisco Hollandais, Cashmere"
              />
              <Input
                label="Fabric Colour / Pattern"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Midnight Navy with Chalk Stripe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
                Workshop & Styling Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Special pocket placements, lining choices, vent preferences, shoulder padding notes..."
                className="w-full text-xs p-3 border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Schedule & Production Dates */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              4. Workshop Schedule & Deadlines
            </h2>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Promised Completion / Collection Date *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <Input
                label="Internal Workshop Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Client flying out on Saturday morning"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Pricing & Initial Deposit */}
        <Card className="border-[#E5E5E5]">
          <div className="p-5 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                5. Financial Ledger & Initial Deposit
              </h2>
            </div>
            <Badge variant="outline" className="text-xs">
              Currency: {currency}
            </Badge>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={`Total Agreed Price (${currency}) *`}
                type="number"
                step="0.01"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                required
              />
              <Input
                label={`Initial Deposit Paid (${currency})`}
                type="number"
                step="0.01"
                min="0"
                max={totalPrice}
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(parseFloat(e.target.value) || 0)}
              />
            </div>

            {initialDeposit > 0 && (
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
                  Deposit Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mobile_money', label: 'Mobile Money (MoMo)' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'bank_transfer', label: 'Bank Transfer' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDepositMethod(m.id as any)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        depositMethod === m.id
                          ? 'border-black bg-black text-white font-bold'
                          : 'border-[#E5E5E5] bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary Gauge */}
            <div className="p-4 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#777777] uppercase tracking-wider font-semibold">
                  Outstanding Balance Due Upon Delivery
                </div>
                <div className="text-xl font-bold text-black mt-0.5">
                  {formatCurrency(balance, currency)}
                </div>
              </div>
              <Badge variant={balance === 0 ? 'success' : 'warning'}>
                {balance === 0 ? 'Fully Paid' : 'Balance Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Submission Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/orders')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating Order...' : 'Generate Workshop Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

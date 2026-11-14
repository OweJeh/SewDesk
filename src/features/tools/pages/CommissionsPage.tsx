// ==============================================================================
// SEWDESK – TAILOR PIECE-RATE COMMISSION TRACKER (WORKSHOP PAYROLL)
// Track per-piece earnings for cutters, stitchers, and workshop assistants
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, Settings, Plus, User, Filter, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { db } from '@/offline/database/dexie-db';
import { formatCurrency, formatDate, generateUUID } from '@/lib/utils';
import type { TailorCommission } from '@/types';

const DEFAULT_PIECE_RATES: Record<string, number> = {
  'Kaftan (3-Piece)': 55,
  '2-Piece Suit': 90,
  'Trousers': 40,
  'Shirt': 35,
  'Kaba & Slit': 60,
  'Agbada': 80,
  'Evening Gown': 75,
  'Pencil Skirt': 30,
  'default': 40,
};

export const CommissionsPage: React.FC = () => {
  const { currentBusiness, hasActiveSubscription } = useCurrentBusiness();
  const bizId = currentBusiness?.id || '';
  const currency = currentBusiness?.default_currency || 'GHS';

  const [commissions, setCommissions] = useState<TailorCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  // Rates configuration modal
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_PIECE_RATES);

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newGarmentType, setNewGarmentType] = useState('Trousers');
  const [newAmount, setNewAmount] = useState(40);

  // Load piece rates from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sewdesk_piece_rates');
      if (saved) {
        setRates(JSON.parse(saved));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Load commissions from Dexie
  const loadCommissions = async () => {
    if (!bizId) return;
    try {
      const rows = await db.commissions.where('business_id').equals(bizId).reverse().sortBy('created_at');
      setCommissions(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [bizId]);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sewdesk_piece_rates', JSON.stringify(rates));
    setIsRatesModalOpen(false);
  };

  const handleMarkPaid = async (id: string) => {
    const now = new Date().toISOString();
    await db.commissions.update(id, {
      status: 'paid',
      paid_at: now,
    });
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paid', paid_at: now } : c))
    );
  };

  const handleBulkMarkPaid = async (staffName: string) => {
    const toUpdate = commissions.filter(
      (c) => c.staff_name === staffName && c.status === 'pending'
    );
    const now = new Date().toISOString();
    for (const item of toUpdate) {
      await db.commissions.update(item.id, {
        status: 'paid',
        paid_at: now,
      });
    }
    setCommissions((prev) =>
      prev.map((c) =>
        c.staff_name === staffName && c.status === 'pending'
          ? { ...c, status: 'paid', paid_at: now }
          : c
      )
    );
  };

  const handleAddCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const record: TailorCommission = {
      id: generateUUID(),
      business_id: bizId,
      staff_id: 'manual',
      staff_name: newStaffName.trim(),
      order_id: 'manual',
      order_number: newOrderNumber.trim() || `ORD-MANUAL`,
      garment_type: newGarmentType,
      amount: Number(newAmount),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    await db.commissions.add(record);
    setCommissions((prev) => [record, ...prev]);
    setIsAddModalOpen(false);
    setNewStaffName('');
    setNewOrderNumber('');
  };

  // Aggregations
  const staffList = Array.from(new Set(commissions.map((c) => c.staff_name)));
  const filteredCommissions = commissions.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (selectedStaff !== 'all' && c.staff_name !== selectedStaff) return false;
    return true;
  });

  const totalPendingAmount = commissions
    .filter((c) => c.status === 'pending')
    .reduce((s, c) => s + c.amount, 0);

  const totalPaidAmount = commissions
    .filter((c) => c.status === 'paid')
    .reduce((s, c) => s + c.amount, 0);

  const totalPieces = commissions.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-black tracking-tight">Workshop Commission Tracker</h1>
            {hasActiveSubscription ? (
              <Badge variant="success">Pro</Badge>
            ) : (
              <Badge variant="warning">Free</Badge>
            )}
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Piece-rate payroll ledger: credit tailors when garments are cut, sewn, and completed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRatesModalOpen(true)}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Piece Rates
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Record
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E5E5]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Pending Payouts
              </div>
              <div className="text-xl font-black text-amber-600 mt-1">
                {formatCurrency(totalPendingAmount, currency)}
              </div>
              <span className="text-[10px] text-neutral-400">
                {commissions.filter((c) => c.status === 'pending').length} pieces awaiting settlement
              </span>
            </div>
            <Clock className="w-8 h-8 text-amber-500/20" />
          </CardContent>
        </Card>

        <Card className="border-[#E5E5E5]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Total Settled Paid
              </div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {formatCurrency(totalPaidAmount, currency)}
              </div>
              <span className="text-[10px] text-neutral-400">
                {commissions.filter((c) => c.status === 'paid').length} pieces paid to workshop staff
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
          </CardContent>
        </Card>

        <Card className="border-[#E5E5E5]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Total Pieces Sewn
              </div>
              <div className="text-xl font-black text-black mt-1">{totalPieces}</div>
              <span className="text-[10px] text-neutral-400">
                Across {staffList.length} workshop tailors
              </span>
            </div>
            <DollarSign className="w-8 h-8 text-neutral-300" />
          </CardContent>
        </Card>
      </div>

      {/* Staff Roll-up Cards with Quick Bulk Pay */}
      {staffList.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-black uppercase tracking-wider">
            Staff Weekly Balances
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList.map((staff) => {
              const staffItems = commissions.filter((c) => c.staff_name === staff);
              const pendingItems = staffItems.filter((c) => c.status === 'pending');
              const pendingSum = pendingItems.reduce((s, c) => s + c.amount, 0);

              return (
                <div
                  key={staff}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-3 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-black">{staff}</div>
                    <div className="text-[11px] text-neutral-500">
                      {pendingItems.length} pending ({formatCurrency(pendingSum, currency)})
                    </div>
                  </div>
                  {pendingSum > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => handleBulkMarkPaid(staff)}
                    >
                      Pay {formatCurrency(pendingSum, currency)}
                    </Button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Settled
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <Card className="border-[#E5E5E5]">
        <div className="p-4 border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Ledger</span>
            <Badge variant="secondary">{filteredCommissions.length} records</Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex gap-1 p-0.5 bg-[#F5F5F5] rounded-lg">
              {(['all', 'pending', 'paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded capitalize transition-all ${
                    filterStatus === st
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Staff Filter */}
            {staffList.length > 0 && (
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="text-xs border border-[#E5E5E5] rounded-lg px-2 py-1 bg-white text-black focus:outline-none"
              >
                <option value="all">All Staff</option>
                {staffList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <DollarSign className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No commission entries match this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-neutral-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3 pl-4">Staff Member</th>
                    <th className="p-3">Order / Garment</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-black">{c.staff_name}</td>
                      <td className="p-3">
                        <div className="font-semibold text-neutral-800">{c.garment_type}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{c.order_number}</div>
                      </td>
                      <td className="p-3 font-black text-black">
                        {formatCurrency(c.amount, currency)}
                      </td>
                      <td className="p-3 text-neutral-500">{formatDate(c.created_at)}</td>
                      <td className="p-3">
                        <Badge variant={c.status === 'paid' ? 'success' : 'warning'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        {c.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => handleMarkPaid(c.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">
                            Paid {c.paid_at ? formatDate(c.paid_at) : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Piece Rate Settings Modal */}
      <Modal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        title="Standard Piece-Rate Commissions"
        description="Set standard earnings per garment type credited to staff upon sewing completion."
      >
        <form onSubmit={handleSaveRates} className="space-y-3">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {Object.keys(rates).map((key) => (
              <div key={key} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-black capitalize">{key}</span>
                <div className="flex items-center gap-1.5 w-32">
                  <span className="text-neutral-400 font-mono">{currency}</span>
                  <input
                    type="number"
                    value={rates[key]}
                    onChange={(e) =>
                      setRates({ ...rates, [key]: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-[#E5E5E5] rounded px-2 py-1 text-right font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRatesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Rates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Manual Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Commission Record"
        description="Record a piece sewn manually for payroll calculation."
      >
        <form onSubmit={handleAddCommission} className="space-y-3">
          <Input
            label="Staff Member Name *"
            placeholder="e.g. Tailor Kwame"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            required
          />

          <Input
            label="Order / Ticket # (optional)"
            placeholder="e.g. ORD-1002"
            value={newOrderNumber}
            onChange={(e) => setNewOrderNumber(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
              Garment Type
            </label>
            <select
              value={newGarmentType}
              onChange={(e) => {
                setNewGarmentType(e.target.value);
                setNewAmount(rates[e.target.value] || rates['default'] || 40);
              }}
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white"
            >
              {Object.keys(rates)
                .filter((k) => k !== 'default')
                .map((g) => (
                  <option key={g} value={g}>
                    {g} ({currency} {rates[g]})
                  </option>
                ))}
            </select>
          </div>

          <Input
            label={`Piece Rate Amount (${currency}) *`}
            type="number"
            step="1"
            value={newAmount}
            onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add to Payroll
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


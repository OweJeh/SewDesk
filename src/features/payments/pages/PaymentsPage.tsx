import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  CreditCard,
  Plus,
  Search,
  TrendingUp,
  Receipt,
  FileCheck2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currency = currentBusiness?.default_currency || 'GHS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Financial Ledger & Payments</h1>
            <Badge variant="outline" className="text-[10px]">
              Multi-Transaction Ledger
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Record customer deposits, staged progress payments, and generate printable receipts.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Payment
        </Button>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
            Total Revenue Collected
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-black">
            {formatCurrency(0, currency)}
          </div>
          <p className="text-[11px] text-[#777777] mt-1">Realized payments in bank / cash / MoMo</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
            Outstanding Balances
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600">
            {formatCurrency(0, currency)}
          </div>
          <p className="text-[11px] text-[#777777] mt-1">Pending collection on active orders</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
            Total Contracted Order Value
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-black">
            {formatCurrency(0, currency)}
          </div>
          <p className="text-[11px] text-[#777777] mt-1">Combined price of all workshop orders</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-black">No payments recorded yet</h3>
          <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
            Payment transactions for client deposits, balances, and refunds will appear here with full receipt export.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record First Deposit
        </Button>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Payment"
        description="Select an order and enter the transaction details to recalculate the balance."
      >
        <div className="space-y-4">
          <Input label="Order Number" placeholder="e.g. ORD-0001" />
          <div className="grid grid-cols-2 gap-3">
            <Input label={`Amount (${currency})`} type="number" placeholder="500.00" />
            <div>
              <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                Payment Method
              </label>
              <select className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:border-black focus:outline-none">
                <option value="mobile_money">Mobile Money (MTN / Telecel / AT)</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Input label="Transaction Reference (Optional)" placeholder="e.g. MoMo Ref #189283920" />
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Confirm & Generate Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

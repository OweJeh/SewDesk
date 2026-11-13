import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Scissors,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

export const OrdersPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currency = currentBusiness?.default_currency || 'GHS';

  const statuses: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Not Started', value: 'not_started' },
    { label: 'Cutting', value: 'cutting' },
    { label: 'Sewing', value: 'sewing' },
    { label: 'Fitting', value: 'fitting' },
    { label: 'Ready', value: 'ready' },
    { label: 'Delivered', value: 'delivered' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Workshop Production Pipeline</h1>
            <Badge variant="outline" className="text-[10px]">
              Active Workshop
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Track garment creation from fabric cutting, stitching, and fitting to final collection.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Order
        </Button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5E5E5] pb-3">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === s.value
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'bg-[#FAFAFA] text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by order number, client name, fabric, or style..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#E5E5E5] rounded-md focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Empty Workshop State */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto text-neutral-500">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-black">No orders in this view</h3>
          <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
            Create an order linked to a customer's exact body measurement set to track garment production stages.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create First Order
        </Button>
      </div>

      {/* Order Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Garment Order"
        description="Link a customer measurement session to generate a workshop work order."
      >
        <div className="space-y-4">
          <Input label="Customer ID or Name" placeholder="Search customer..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Garment Type" placeholder="e.g. 3-Piece Bespoke Suit" />
            <Input label="Fabric / Material" placeholder="e.g. Super 150s Wool" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total Price (GHS)" type="number" placeholder="1800.00" />
            <Input label="Due Date" type="date" />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Generate Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

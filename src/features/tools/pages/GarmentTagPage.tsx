// ==============================================================================
// SEWDESK – ATELIER GARMENT BAG TAG & QR CODE GENERATOR
// Printable hanger slip / fabric bundle tag with scannable QR code
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tag, Printer, ArrowLeft, Scissors, Calendar, User, Phone, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from '@/components/common/QRCodeSVG';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { db } from '@/offline/database/dexie-db';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, Customer } from '@/types';

export const GarmentTagPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const [searchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get('orderId') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId);
  const [loading, setLoading] = useState(true);

  const currency = currentBusiness?.default_currency || 'GHS';
  const bizId = currentBusiness?.id || '';

  useEffect(() => {
    if (!bizId) return;
    const loadData = async () => {
      try {
        const [ordRows, custRows] = await Promise.all([
          db.orders.where('business_id').equals(bizId).reverse().sortBy('created_at'),
          db.customers.where('business_id').equals(bizId).toArray(),
        ]);
        setOrders(ordRows);
        const map: Record<string, Customer> = {};
        custRows.forEach((c) => {
          map[c.id] = c;
        });
        setCustomers(map);
        if (!selectedOrderId && ordRows.length > 0) {
          setSelectedOrderId(ordRows[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bizId, selectedOrderId]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedCustomer = selectedOrder ? customers[selectedOrder.customer_id] : null;

  const orderDeepLink = selectedOrder
    ? `${window.location.origin}/app/orders/${selectedOrder.id}`
    : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Top Header - hidden during print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-black tracking-tight">Garment Bag Tag Generator</h1>
            <Badge variant="outline">Print Ready</Badge>
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Printable hanger slip and fabric bundle tag with QR code for swift workshop scanning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            disabled={!selectedOrder}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Tag
          </Button>
        </div>
      </div>

      {/* Order Picker - hidden during print */}
      <Card className="border-[#E5E5E5] print:hidden">
        <CardContent className="p-4">
          <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
            Select Order to Generate Tag
          </label>
          <div className="relative">
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black"
            >
              {orders.length === 0 ? (
                <option value="">No orders found</option>
              ) : (
                orders.map((o) => {
                  const cust = customers[o.customer_id];
                  return (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — {cust?.full_name || 'Walk-in'} ({o.garment_type || 'Garment'}) [Status: {o.status}]
                    </option>
                  );
                })
              )}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      {/* Tag Preview / Printable Tag Box */}
      {selectedOrder && (
        <div className="flex justify-center print:block">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-xl p-6 shadow-sm print:border-2 print:border-black print:rounded-none print:shadow-none print:w-full print:max-w-full">
            {/* Tag Header */}
            <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#777777] block">
                  {currentBusiness?.business_name || 'ATELIER WORKSHOP'}
                </span>
                <h2 className="text-2xl font-black text-black tracking-tight mt-0.5">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 border border-black text-black text-[10px] font-black uppercase rounded tracking-wider">
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Client & Garment Details */}
            <div className="space-y-3 border-b-2 border-black pb-4 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-neutral-500">Customer</span>
                <span className="text-sm font-black text-black">
                  {selectedCustomer?.full_name || 'Walk-in Client'}
                </span>
              </div>

              {selectedCustomer?.phone && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase font-bold text-neutral-500">Contact</span>
                  <span className="text-xs font-mono font-bold text-black">
                    {selectedCustomer.phone}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-neutral-500">Garment</span>
                <span className="text-sm font-black text-black capitalize">
                  {selectedOrder.garment_type || 'Custom Garment'}
                </span>
              </div>

              {selectedOrder.due_date && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase font-bold text-neutral-500">Deadline</span>
                  <span className="text-xs font-bold text-black">
                    {formatDate(selectedOrder.due_date)}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Status */}
            {(() => {
              const balance = selectedOrder.balance ?? 0;
              return (
                <div className="flex items-center justify-between bg-[#F5F5F5] p-3 rounded-lg border border-[#E5E5E5] mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Agreed</span>
                    <span className="text-xs font-bold text-black">
                      {formatCurrency(selectedOrder.total_price, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Balance Due</span>
                    <span className={`text-sm font-black ${balance > 0 ? 'text-black' : 'text-emerald-700'}`}>
                      {balance > 0 ? formatCurrency(balance, currency) : 'PAID IN FULL'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Style Notes */}
            {selectedOrder.notes && (
              <div className="mb-4 p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                <span className="text-[9px] uppercase font-black text-neutral-500 block mb-0.5">
                  Production / Style Notes
                </span>
                <p className="text-xs text-neutral-700 italic">
                  "{selectedOrder.notes}"
                </p>
              </div>
            )}

            {/* QR Code and Scan Instruction */}
            <div className="flex items-center gap-4 pt-2">
              <div className="p-2 border border-black rounded-lg bg-white shrink-0">
                <QRCodeSVG value={orderDeepLink} size={84} />
              </div>
              <div className="text-left space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                  Scan to Open Ticket
                </span>
                <p className="text-[10px] text-neutral-600 leading-tight">
                  Point any phone camera or barcode scanner at this QR code to instantly pull up complete client measurements and cutting instructions.
                </p>
                <span className="text-[9px] font-mono text-neutral-400 block truncate max-w-[200px]">
                  {selectedOrder.order_number}
                </span>
              </div>
            </div>

            {/* Tag Footer */}
            <div className="mt-4 pt-3 border-t border-dashed border-neutral-300 flex justify-between items-center text-[9px] text-neutral-400 font-mono">
              <span>PIN TO HANGER / FABRIC BUNDLE</span>
              <span>SEWDESK ATELIER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

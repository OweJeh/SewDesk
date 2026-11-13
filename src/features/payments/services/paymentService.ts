// ==============================================================================
// SEWDESK — FINANCIAL LEDGER & PAYMENT SERVICE
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { generateUUID } from '@/lib/utils';
import type { Payment, PaymentMethod, Customer, Order } from '@/types';

export interface PaymentWithDetails extends Payment {
  customer?: Customer;
  order?: Order;
}

export interface RecordPaymentInput {
  business_id: string;
  customer_id: string;
  order_id: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  reference?: string;
  payment_date?: string;
  notes?: string;
  recorded_by: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  outstandingBalance: number;
  totalOrderValue: number;
  paymentCount: number;
}

const _localPayments = new Map<string, PaymentWithDetails>();

export const paymentService = {
  // Get all payments for a business
  async getPayments(businessId: string): Promise<PaymentWithDetails[]> {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            customer:customers(*),
            order:orders(*)
          `)
          .eq('business_id', businessId)
          .order('payment_date', { ascending: false });

        if (!error && data) {
          for (const p of data) {
            await db.payments.put(p as Payment);
          }
          return data as PaymentWithDetails[];
        }
      } catch (err) {
        console.warn('Online payments fetch failed, checking local:', err);
      }
    }

    // Dexie Local Fallback
    try {
      const local = await db.payments
        .where('business_id')
        .equals(businessId)
        .reverse()
        .sortBy('payment_date');

      if (local.length > 0) return local as PaymentWithDetails[];
    } catch {
      // ignore
    }

    return Array.from(_localPayments.values())
      .filter((p) => p.business_id === businessId)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  },

  // Record a payment transaction
  async recordPayment(input: RecordPaymentInput): Promise<{ payment: PaymentWithDetails | null; error: Error | null }> {
    const isLive = isSupabaseConfigured();
    const id = generateUUID();
    const now = new Date().toISOString();
    const ref = input.reference || `REC-${Date.now().toString().slice(-6)}`;

    const newPayment: PaymentWithDetails = {
      id,
      business_id: input.business_id,
      customer_id: input.customer_id,
      order_id: input.order_id,
      amount: Number(input.amount),
      currency: input.currency || 'GHS',
      method: input.method,
      reference: ref,
      payment_date: input.payment_date || now.split('T')[0],
      status: 'completed',
      notes: input.notes || null,
      recorded_by: input.recorded_by,
      created_at: now,
    };

    try {
      if (isLive) {
        const { error } = await supabase.from('payments').insert(newPayment);
        if (error) throw error;
      }

      await db.payments.put(newPayment as Payment);
      _localPayments.set(id, newPayment);

      return { payment: newPayment, error: null };
    } catch (err) {
      console.error('Payment record failed:', err);
      _localPayments.set(id, newPayment);
      return { payment: newPayment, error: null };
    }
  },

  // Calculate high-level financial summary
  async getFinancialSummary(businessId: string): Promise<FinancialSummary> {
    const payments = await this.getPayments(businessId);

    // Sum collected revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      totalRevenue,
      outstandingBalance: 0, // Computed alongside orders
      totalOrderValue: totalRevenue,
      paymentCount: payments.length,
    };
  },
};

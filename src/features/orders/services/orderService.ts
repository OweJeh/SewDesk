// ==============================================================================
// SEWDESK — WORKSHOP ORDER SERVICE & PRODUCTION PIPELINE
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { generateUUID } from '@/lib/utils';
import type { Order, OrderStatus, Customer, MeasurementSet, Payment } from '@/types';

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string | null;
  changed_by: string;
  created_at: string;
  changed_by_name?: string;
}

export interface CreateOrderInput {
  business_id: string;
  customer_id: string;
  measurement_set_id: string;
  garment_type: string;
  description?: string;
  fabric?: string;
  colour?: string;
  style?: string;
  total_price: number;
  currency?: string;
  assigned_to?: string | null;
  due_date?: string | null;
  notes?: string;
  created_by: string;
  initial_deposit?: number;
  deposit_payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'other';
}

export interface OrderWithDetails extends Order {
  customer?: Customer;
  measurement_set?: MeasurementSet;
  status_history?: OrderStatusHistoryItem[];
  payments?: Payment[];
  amount_paid: number;
  balance: number;
}

// In-memory fallback for local session/testing
const _localOrders = new Map<string, OrderWithDetails>();
const _localHistory = new Map<string, OrderStatusHistoryItem[]>();

export const orderService = {
  // Fetch all orders for a business
  async getOrders(businessId: string): Promise<OrderWithDetails[]> {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customers(*),
            measurement_set:measurement_sets(*),
            payments(*)
          `)
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: OrderWithDetails[] = data.map((row: any) => {
            const payments: Payment[] = row.payments || [];
            const amount_paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const balance = Math.max(0, Number(row.total_price) - amount_paid);

            return {
              ...row,
              amount_paid,
              balance,
            };
          });

          // Sync to Dexie
          for (const ord of mapped) {
            await db.orders.put(ord as Order);
          }

          return mapped;
        }
      } catch (err) {
        console.warn('Online orders fetch failed, falling back to local:', err);
      }
    }

    // Dexie Local Fallback
    try {
      const dexieOrders = await db.orders
        .where('business_id')
        .equals(businessId)
        .reverse()
        .sortBy('created_at');

      if (dexieOrders.length > 0) {
        return dexieOrders.map((ord) => ({
          ...ord,
          amount_paid: ord.amount_paid || 0,
          balance: ord.balance !== undefined ? ord.balance : ord.total_price,
        }));
      }
    } catch {
      // ignore
    }

    // In-memory fallback
    return Array.from(_localOrders.values())
      .filter((o) => o.business_id === businessId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Fetch a single order with complete details
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const isLive = isSupabaseConfigured();

    if (isLive) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customers(*),
            measurement_set:measurement_sets(*, values:measurement_values(*)),
            payments(*),
            status_history:order_status_history(*)
          `)
          .eq('id', orderId)
          .single();

        if (!error && data) {
          const payments: Payment[] = data.payments || [];
          const amount_paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          const balance = Math.max(0, Number(data.total_price) - amount_paid);

          const result: OrderWithDetails = {
            ...data,
            amount_paid,
            balance,
            status_history: (data.status_history || []).sort(
              (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
          };

          await db.orders.put(result as Order);
          return result;
        }
      } catch (err) {
        console.warn('Online single order fetch failed:', err);
      }
    }

    // Local fallback
    if (_localOrders.has(orderId)) {
      return _localOrders.get(orderId)!;
    }

    try {
      const dexieOrd = await db.orders.get(orderId);
      if (dexieOrd) {
        return {
          ...dexieOrd,
          amount_paid: dexieOrd.amount_paid || 0,
          balance: dexieOrd.balance !== undefined ? dexieOrd.balance : dexieOrd.total_price,
          status_history: _localHistory.get(orderId) || [],
        };
      }
    } catch {
      // ignore
    }

    return null;
  },

  // Create a new order
  async createOrder(input: CreateOrderInput): Promise<{ order: OrderWithDetails | null; error: Error | null }> {
    const isLive = isSupabaseConfigured();
    const orderId = generateUUID();
    const now = new Date().toISOString();

    // Determine sequential order number
    const existingOrders = await this.getOrders(input.business_id);
    const orderSeq = existingOrders.length + 1;
    const orderNumber = `ORD-${String(orderSeq).padStart(4, '0')}`;

    const newOrder: Order = {
      id: orderId,
      business_id: input.business_id,
      customer_id: input.customer_id,
      order_number: orderNumber,
      garment_type: input.garment_type,
      description: input.description || null,
      fabric: input.fabric || null,
      colour: input.colour || null,
      style: input.style || null,
      total_price: Number(input.total_price) || 0,
      currency: input.currency || 'GHS',
      measurement_set_id: input.measurement_set_id,
      assigned_to: input.assigned_to || null,
      due_date: input.due_date || null,
      status: 'not_started',
      notes: input.notes || null,
      created_by: input.created_by,
      created_at: now,
      updated_at: now,
    };

    const initialHistory: OrderStatusHistoryItem = {
      id: generateUUID(),
      order_id: orderId,
      previous_status: null,
      new_status: 'not_started',
      note: 'Order created in workshop queue',
      changed_by: input.created_by,
      created_at: now,
    };

    let initialPayment: Payment | null = null;
    if (input.initial_deposit && input.initial_deposit > 0) {
      initialPayment = {
        id: generateUUID(),
        business_id: input.business_id,
        customer_id: input.customer_id,
        order_id: orderId,
        amount: Number(input.initial_deposit),
        currency: input.currency || 'GHS',
        method: input.deposit_payment_method || 'cash',
        reference: `DEP-${orderNumber}`,
        payment_date: now.split('T')[0],
        status: 'completed',
        notes: 'Initial order deposit',
        recorded_by: input.created_by,
        created_at: now,
      };
    }

    try {
      if (isLive) {
        // Insert order
        const { error: oErr } = await supabase.from('orders').insert(newOrder);
        if (oErr) throw oErr;

        // Insert initial history
        await supabase.from('order_status_history').insert({
          id: initialHistory.id,
          business_id: input.business_id,
          order_id: orderId,
          previous_status: null,
          new_status: 'not_started',
          note: initialHistory.note,
          changed_by: input.created_by,
          created_at: now,
        });

        // Insert deposit if provided
        if (initialPayment) {
          await supabase.from('payments').insert(initialPayment);
        }
      }

      // Local Dexie Persistence
      await db.orders.put(newOrder);
      if (initialPayment) {
        await db.payments.put(initialPayment);
      }

      // In-memory cache update
      const amount_paid = initialPayment ? initialPayment.amount : 0;
      const balance = Math.max(0, newOrder.total_price - amount_paid);

      const detailedOrder: OrderWithDetails = {
        ...newOrder,
        amount_paid,
        balance,
        status_history: [initialHistory],
        payments: initialPayment ? [initialPayment] : [],
      };

      _localOrders.set(orderId, detailedOrder);
      _localHistory.set(orderId, [initialHistory]);

      return { order: detailedOrder, error: null };
    } catch (err) {
      console.error('Order creation error:', err);
      // Fallback save in local
      const amount_paid = initialPayment ? initialPayment.amount : 0;
      const balance = Math.max(0, newOrder.total_price - amount_paid);
      const detailedOrder: OrderWithDetails = {
        ...newOrder,
        amount_paid,
        balance,
        status_history: [initialHistory],
        payments: initialPayment ? [initialPayment] : [],
      };
      _localOrders.set(orderId, detailedOrder);
      return { order: detailedOrder, error: null };
    }
  },

  // Advance or change order status
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    changedBy: string = 'system'
  ): Promise<{ success: boolean; error: Error | null }> {
    const isLive = isSupabaseConfigured();
    const now = new Date().toISOString();

    const currentOrder = await this.getOrderById(orderId);
    const previousStatus = currentOrder ? currentOrder.status : null;

    const historyItem: OrderStatusHistoryItem = {
      id: generateUUID(),
      order_id: orderId,
      previous_status: previousStatus,
      new_status: newStatus,
      note: note || `Status changed from ${previousStatus || 'none'} to ${newStatus}`,
      changed_by: changedBy,
      created_at: now,
    };

    try {
      if (isLive) {
        const { error: oErr } = await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: now })
          .eq('id', orderId);

        if (oErr) throw oErr;

        if (currentOrder?.business_id) {
          await supabase.from('order_status_history').insert({
            id: historyItem.id,
            business_id: currentOrder.business_id,
            order_id: orderId,
            previous_status: previousStatus,
            new_status: newStatus,
            note: historyItem.note,
            changed_by: changedBy,
            created_at: now,
          });
        }
      }

      // Update Dexie
      const localOrd = await db.orders.get(orderId);
      if (localOrd) {
        await db.orders.put({ ...localOrd, status: newStatus, updated_at: now });
      }

      // Update in-memory
      if (_localOrders.has(orderId)) {
        const ord = _localOrders.get(orderId)!;
        ord.status = newStatus;
        ord.updated_at = now;
        ord.status_history = [historyItem, ...(ord.status_history || [])];
      }

      const existingHistory = _localHistory.get(orderId) || [];
      _localHistory.set(orderId, [historyItem, ...existingHistory]);

      return { success: true, error: null };
    } catch (err) {
      console.error('Failed to update order status:', err);
      return { success: false, error: err as Error };
    }
  },

  // Assign order to staff member
  async assignOrder(
    orderId: string,
    assignedToId: string | null
  ): Promise<{ success: boolean; error: Error | null }> {
    const isLive = isSupabaseConfigured();
    const now = new Date().toISOString();

    try {
      if (isLive) {
        const { error } = await supabase
          .from('orders')
          .update({ assigned_to: assignedToId, updated_at: now })
          .eq('id', orderId);
        if (error) throw error;
      }

      const localOrd = await db.orders.get(orderId);
      if (localOrd) {
        await db.orders.put({ ...localOrd, assigned_to: assignedToId, updated_at: now });
      }

      if (_localOrders.has(orderId)) {
        const ord = _localOrders.get(orderId)!;
        ord.assigned_to = assignedToId;
        ord.updated_at = now;
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  },
};

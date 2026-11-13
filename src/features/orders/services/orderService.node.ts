// ==============================================================================
// SEWDESK — ORDER SERVICE NODE-COMPATIBLE SHIM (Test Environment)
// Pure in-memory order engine for automated verification
// ==============================================================================

import type { Order, OrderStatus, Customer, MeasurementSet, Payment } from '../../../types/index.ts';

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string | null;
  changed_by: string;
  created_at: string;
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

export class OrderTestEngine {
  orders = new Map<string, OrderWithDetails>();
  statusHistory = new Map<string, OrderStatusHistoryItem[]>();
  payments = new Map<string, Payment[]>();

  createOrder(input: CreateOrderInput): OrderWithDetails {
    const orderId = 'ord-' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const existingForBiz = Array.from(this.orders.values()).filter((o) => o.business_id === input.business_id);
    const orderNumber = `ORD-${String(existingForBiz.length + 1).padStart(4, '0')}`;

    const initialHistory: OrderStatusHistoryItem = {
      id: 'hist-' + crypto.randomUUID().slice(0, 8),
      order_id: orderId,
      previous_status: null,
      new_status: 'not_started',
      note: 'Order created in workshop queue',
      changed_by: input.created_by,
      created_at: now,
    };

    let initialPayment: Payment | null = null;
    const initialDeposit = Number(input.initial_deposit) || 0;
    if (initialDeposit > 0) {
      initialPayment = {
        id: 'pay-' + crypto.randomUUID().slice(0, 8),
        business_id: input.business_id,
        customer_id: input.customer_id,
        order_id: orderId,
        amount: initialDeposit,
        currency: input.currency || 'GHS',
        method: input.deposit_payment_method || 'cash',
        reference: `DEP-${orderNumber}`,
        payment_date: now.split('T')[0],
        status: 'completed',
        notes: 'Initial order deposit',
        recorded_by: input.created_by,
        created_at: now,
      };
      this.payments.set(orderId, [initialPayment]);
    } else {
      this.payments.set(orderId, []);
    }

    const amount_paid = initialDeposit;
    const balance = Math.max(0, input.total_price - amount_paid);

    const detailedOrder: OrderWithDetails = {
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
      amount_paid,
      balance,
      status_history: [initialHistory],
      payments: initialPayment ? [initialPayment] : [],
    };

    this.orders.set(orderId, detailedOrder);
    this.statusHistory.set(orderId, [initialHistory]);

    return detailedOrder;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, changedBy = 'tailor-1'): OrderWithDetails {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const previousStatus = order.status;
    const now = new Date().toISOString();

    const historyItem: OrderStatusHistoryItem = {
      id: 'hist-' + crypto.randomUUID().slice(0, 8),
      order_id: orderId,
      previous_status: previousStatus,
      new_status: newStatus,
      note: note || `Advanced to ${newStatus}`,
      changed_by: changedBy,
      created_at: now,
    };

    order.status = newStatus;
    order.updated_at = now;
    order.status_history = [historyItem, ...(order.status_history || [])];

    const historyList = this.statusHistory.get(orderId) || [];
    this.statusHistory.set(orderId, [historyItem, ...historyList]);

    return order;
  }

  recordPayment(orderId: string, amount: number, method: 'cash' | 'mobile_money' | 'bank_transfer' = 'mobile_money'): Payment {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const now = new Date().toISOString();
    const payment: Payment = {
      id: 'pay-' + crypto.randomUUID().slice(0, 8),
      business_id: order.business_id,
      customer_id: order.customer_id,
      order_id: orderId,
      amount,
      currency: order.currency,
      method,
      reference: `PAY-${Date.now().toString().slice(-6)}`,
      payment_date: now.split('T')[0],
      status: 'completed',
      recorded_by: 'accountant-1',
      created_at: now,
    };

    const currentPayments = this.payments.get(orderId) || [];
    currentPayments.push(payment);
    this.payments.set(orderId, currentPayments);

    order.payments = currentPayments;
    order.amount_paid = currentPayments.reduce((s, p) => s + p.amount, 0);
    order.balance = Math.max(0, order.total_price - order.amount_paid);

    return payment;
  }
}

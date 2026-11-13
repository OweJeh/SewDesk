import Dexie, { type Table } from 'dexie';
import type {
  Profile,
  Business,
  BusinessMember,
  Customer,
  MeasurementSet,
  MeasurementValue,
  Order,
  Payment,
  BusinessInvitation
} from '../../types/index.ts';

export interface SyncOperation {
  id: string;
  businessId: string;
  entityType: 'customer' | 'measurement' | 'order' | 'payment' | 'note';
  operationType: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  retryCount: number;
  lastError?: string;
}

export class SewDeskDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  businesses!: Table<Business, string>;
  businessMembers!: Table<BusinessMember, string>;
  businessInvitations!: Table<BusinessInvitation, string>;
  customers!: Table<Customer, string>;
  measurementSets!: Table<MeasurementSet, string>;
  measurementValues!: Table<MeasurementValue, string>;
  orders!: Table<Order, string>;
  payments!: Table<Payment, string>;
  syncQueue!: Table<SyncOperation, string>;

  constructor() {
    super('SewDeskOfflineDB');
    this.version(1).stores({
      profiles: 'id, email',
      businesses: 'id, owner_profile_id',
      businessMembers: 'id, business_id, profile_id, role',
      businessInvitations: 'id, business_id, invited_email',
      customers: 'id, business_id, customer_number, phone, full_name',
      measurementSets: 'id, business_id, customer_id',
      measurementValues: 'id, measurement_set_id',
      orders: 'id, business_id, customer_id, order_number, status',
      payments: 'id, business_id, order_id, customer_id',
      syncQueue: 'id, businessId, status, createdAt',
    });
  }
}

export const db = new SewDeskDatabase();


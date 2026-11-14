// ==============================================================================
// SEWDESK — DOMAIN & DATABASE TYPES
// ==============================================================================

export type BusinessRole = 'owner' | 'admin' | 'tailor' | 'assistant' | 'accountant';

export type OrderStatus =
  | 'not_started'
  | 'cutting'
  | 'sewing'
  | 'fitting'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer' | 'other';

export type SubscriptionStatus =
  | 'free'
  | 'active'
  | 'pending_payment'
  | 'expired'
  | 'cancelled'
  | 'payment_failed';

export type MeasurementUnit = 'cm' | 'inch';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  business_name: string;
  business_type: string;
  owner_profile_id: string;
  contact_email: string;
  phone: string;
  whatsapp?: string | null;
  country: string;
  region?: string | null;
  city: string;
  logo_url?: string | null;
  default_currency: string;
  default_measurement_unit: MeasurementUnit;
  customer_slots_used: number;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  profile_id: string;
  role: BusinessRole;
  invitation_status: 'active' | 'suspended';
  joined_at: string;
  created_at: string;
  profile?: Profile;
}

export interface BusinessInvitation {
  id: string;
  business_id: string;
  invited_email: string;
  role: BusinessRole;
  invitation_token_hash: string;
  expires_at: string;
  accepted_at?: string | null;
  invited_by: string;
  created_at: string;
}

export interface PlatformAdmin {
  id: string;
  profile_id: string;
  granted_by?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  customer_number: string;
  full_name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  measurement_profile?: string | null;
  location?: string | null;
  photo_url?: string | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  total_orders?: number;
  total_spent?: number;
  outstanding_balance?: number;
}

export interface MeasurementDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  default_unit: MeasurementUnit;
  validation_min: number;
  validation_max: number;
}

export interface MeasurementTemplate {
  id: string;
  business_id?: string | null;
  name: string;
  description?: string;
  profile_type: 'Male' | 'Female' | 'Children' | 'Custom';
  is_system_template: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface MeasurementSet {
  id: string;
  business_id: string;
  customer_id: string;
  template_id?: string | null;
  garment_type: string;
  session_name: string;
  fit_notes?: string | null;
  recorded_by: string;
  created_at: string;
  values?: MeasurementValue[];
}

export interface MeasurementValue {
  id: string;
  measurement_set_id: string;
  measurement_definition_id?: string | null;
  field_name: string;
  original_value: number;
  original_unit: MeasurementUnit;
  canonical_cm_value: number;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  garment_type: string;
  description?: string | null;
  fabric?: string | null;
  colour?: string | null;
  style?: string | null;
  total_price: number;
  currency: string;
  measurement_set_id: string;
  assigned_to?: string | null;
  due_date?: string | null;
  status: OrderStatus;
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  amount_paid?: number;
  balance?: number;
}

export interface Payment {
  id: string;
  business_id: string;
  customer_id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string | null;
  payment_date: string;
  status: 'completed' | 'refunded' | 'pending';
  notes?: string | null;
  recorded_by: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  expires_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  business_id: string;
  recipient_profile_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

export interface OrderAttachment {
  id: string;
  business_id: string;
  order_id: string;
  file_url: string;
  attachment_type: 'fabric_swatch' | 'style_inspiration' | 'pattern';
  caption?: string | null;
  uploaded_by?: string;
  created_at: string;
}

export interface CustomerPosturePhoto {
  id: string;
  business_id: string;
  customer_id: string;
  photo_url: string;
  view_angle: 'front' | 'side' | 'back';
  notes?: string | null;
  created_at: string;
}

export interface TailorCommission {
  id: string;
  business_id: string;
  staff_id: string;
  staff_name: string;
  order_id: string;
  order_number: string;
  garment_type: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_at?: string | null;
  created_at: string;
}


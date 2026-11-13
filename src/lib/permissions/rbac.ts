import type { BusinessRole } from '@/types';

export type Permission =
  | 'manage_business'
  | 'manage_subscriptions'
  | 'manage_staff'
  | 'view_customers'
  | 'create_customers'
  | 'edit_customers'
  | 'archive_customers'
  | 'record_measurements'
  | 'view_measurements'
  | 'create_orders'
  | 'update_orders'
  | 'update_production_status'
  | 'record_fittings'
  | 'view_payments'
  | 'record_payments'
  | 'export_reports'
  | 'view_financial_reports';

export const ROLE_PERMISSIONS: Record<BusinessRole, Permission[]> = {
  owner: [
    'manage_business',
    'manage_subscriptions',
    'manage_staff',
    'view_customers',
    'create_customers',
    'edit_customers',
    'archive_customers',
    'record_measurements',
    'view_measurements',
    'create_orders',
    'update_orders',
    'update_production_status',
    'record_fittings',
    'view_payments',
    'record_payments',
    'export_reports',
    'view_financial_reports',
  ],
  admin: [
    'manage_staff',
    'view_customers',
    'create_customers',
    'edit_customers',
    'record_measurements',
    'view_measurements',
    'create_orders',
    'update_orders',
    'update_production_status',
    'record_fittings',
    'view_payments',
    'record_payments',
    'export_reports',
    'view_financial_reports',
  ],
  tailor: [
    'view_customers',
    'create_customers',
    'edit_customers',
    'record_measurements',
    'view_measurements',
    'create_orders',
    'update_orders',
    'update_production_status',
    'record_fittings',
  ],
  assistant: [
    'view_customers',
    'create_customers',
    'view_measurements',
    'create_orders',
    'update_production_status',
  ],
  accountant: [
    'view_customers',
    'view_payments',
    'record_payments',
    'view_financial_reports',
    'export_reports',
  ],
};

export function hasPermission(role: BusinessRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRoleBadgeLabel(role: BusinessRole): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'tailor':
      return 'Tailor';
    case 'assistant':
      return 'Assistant';
    case 'accountant':
      return 'Accountant';
    default:
      return role;
  }
}

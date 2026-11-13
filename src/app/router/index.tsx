import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PlatformLayout } from '@/app/layouts/PlatformLayout';
import { RequireAuth, RequireBusiness } from '@/app/router/RouteGuards';

// Public pages
import { HomePage } from '@/features/public/pages/HomePage';
import { AboutPage } from '@/features/public/pages/AboutPage';
import { FeaturesPage } from '@/features/public/pages/FeaturesPage';
import { PricingPage } from '@/features/public/pages/PricingPage';
import { PrivacyPage } from '@/features/public/pages/PrivacyPage';
import { TermsPage } from '@/features/public/pages/TermsPage';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';

// Business Workspace pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { NewCustomerPage } from '@/features/customers/pages/NewCustomerPage';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { MeasurementsPage } from '@/features/measurements/pages/MeasurementsPage';
import { NewMeasurementSessionPage } from '@/features/measurements/pages/NewMeasurementSessionPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { NewOrderPage } from '@/features/orders/pages/NewOrderPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { PaymentsPage } from '@/features/payments/pages/PaymentsPage';
import { StaffPage } from '@/features/staff/pages/StaffPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { SubscriptionPage } from '@/features/subscriptions/pages/SubscriptionPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

// Platform Admin pages
import { PlatformDashboardPage } from '@/features/platform-admin/pages/PlatformDashboardPage';
import { PlatformBusinessesPage } from '@/features/platform-admin/pages/PlatformBusinessesPage';
import { PlatformSubscriptionsPage } from '@/features/platform-admin/pages/PlatformSubscriptionsPage';
import { PlatformTransactionsPage } from '@/features/platform-admin/pages/PlatformTransactionsPage';
import { PlatformAuditLogsPage } from '@/features/platform-admin/pages/PlatformAuditLogsPage';
import { PlatformSettingsPage } from '@/features/platform-admin/pages/PlatformSettingsPage';

export const router = createBrowserRouter([
  // Public Marketing Website
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'features', element: <FeaturesPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Onboarding (Protected by Auth)
  {
    path: '/onboarding',
    element: (
      <RequireAuth>
        <OnboardingPage />
      </RequireAuth>
    ),
  },

  // Business Workspace (Protected by Auth and Business Membership)
  {
    path: '/app',
    element: (
      <RequireAuth>
        <RequireBusiness>
          <AppLayout />
        </RequireBusiness>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/new', element: <NewCustomerPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'customers/:id/measurements', element: <CustomerDetailPage /> },
      { path: 'measurements', element: <MeasurementsPage /> },
      { path: 'measurements/new', element: <NewMeasurementSessionPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/new', element: <NewOrderPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'subscription', element: <SubscriptionPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Platform Administration (Protected Operator Environment)
  {
    path: '/platform',
    element: (
      <RequireAuth>
        <PlatformLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/platform/dashboard" replace /> },
      { path: 'dashboard', element: <PlatformDashboardPage /> },
      { path: 'businesses', element: <PlatformBusinessesPage /> },
      { path: 'subscriptions', element: <PlatformSubscriptionsPage /> },
      { path: 'transactions', element: <PlatformTransactionsPage /> },
      { path: 'audit-logs', element: <PlatformAuditLogsPage /> },
      { path: 'settings', element: <PlatformSettingsPage /> },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

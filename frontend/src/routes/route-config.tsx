import React from 'react';
import { RouteObject, Navigate, useParams } from 'react-router-dom';

function QuotationRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/quotations/${id}`} replace />;
}

function ApprovalRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/approvals/${id}`} replace />;
}

function PipelineRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/pipeline/${id}`} replace />;
}

function FulfillmentRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/fulfillment/${id}`} replace />;
}

function WarehouseRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/warehouses/${id}`} replace />;
}

function InvoiceRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/invoices/${id}`} replace />;
}

function SubscriptionRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/subscriptions/${id}`} replace />;
}

function DealHealthRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/deal-health/${id}`} replace />;
}

function ProductRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/products/${id}`} replace />;
}

import { InternalLayout } from '@/components/layout/InternalLayout';
import { CustomerPortalLayout } from '@/components/layout/CustomerPortalLayout';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { RoleGuard } from '@/components/navigation/RoleGuard';

import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Route-Level Lazy Loading for Sub-Second Initial Bundle Performance
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const QuotationsListPage = React.lazy(() => import('@/pages/quotations/QuotationsListPage').then(m => ({ default: m.QuotationsListPage })));
const QuotationCreatePage = React.lazy(() => import('@/pages/quotations/QuotationCreatePage').then(m => ({ default: m.QuotationCreatePage })));
const QuotationDetailPage = React.lazy(() => import('@/pages/quotations/QuotationDetailPage').then(m => ({ default: m.QuotationDetailPage })));
const QuotationApprovalPage = React.lazy(() => import('@/pages/quotations/QuotationApprovalPage').then(m => ({ default: m.QuotationApprovalPage })));
const QuotationFulfillmentPage = React.lazy(() => import('@/pages/quotations/QuotationFulfillmentPage').then(m => ({ default: m.QuotationFulfillmentPage })));
const QuotationBillingPage = React.lazy(() => import('@/pages/quotations/QuotationBillingPage').then(m => ({ default: m.QuotationBillingPage })));
const PipelinePage = React.lazy(() => import('@/pages/pipeline/PipelinePage').then(m => ({ default: m.PipelinePage })));
const DealDetailPage = React.lazy(() => import('@/pages/pipeline/DealDetailPage').then(m => ({ default: m.DealDetailPage })));
const ApprovalsPage = React.lazy(() => import('@/pages/approvals/ApprovalsPage').then(m => ({ default: m.ApprovalsPage })));
const ApprovalDetailPage = React.lazy(() => import('@/pages/approvals/ApprovalDetailPage').then(m => ({ default: m.ApprovalDetailPage })));
const FulfillmentPage = React.lazy(() => import('@/pages/fulfillment/FulfillmentPage').then(m => ({ default: m.FulfillmentPage })));
const FulfillmentDetailPage = React.lazy(() => import('@/pages/fulfillment/FulfillmentDetailPage').then(m => ({ default: m.FulfillmentDetailPage })));
const BillingPage = React.lazy(() => import('@/pages/billing/BillingPage').then(m => ({ default: m.BillingPage })));
const InvoicesPage = React.lazy(() => import('@/pages/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const InvoiceDetailPage = React.lazy(() => import('@/pages/invoices/InvoiceDetailPage').then(m => ({ default: m.InvoiceDetailPage })));
const SubscriptionsPage = React.lazy(() => import('@/pages/subscriptions/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const SubscriptionDetailPage = React.lazy(() => import('@/pages/subscriptions/SubscriptionDetailPage').then(m => ({ default: m.SubscriptionDetailPage })));
const CustomersPage = React.lazy(() => import('@/pages/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const ProductsPage = React.lazy(() => import('@/pages/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const NewProductPage = React.lazy(() => import('@/pages/products/NewProductPage').then(m => ({ default: m.NewProductPage })));
const ProductDetailPage = React.lazy(() => import('@/pages/products/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const EditProductPage = React.lazy(() => import('@/pages/products/EditProductPage').then(m => ({ default: m.EditProductPage })));
const WarehousesPage = React.lazy(() => import('@/pages/warehouses/WarehousesPage').then(m => ({ default: m.WarehousesPage })));
const WarehouseDetailPage = React.lazy(() => import('@/pages/warehouses/WarehouseDetailPage').then(m => ({ default: m.WarehouseDetailPage })));
const DealHealthPage = React.lazy(() => import('@/pages/deal-health/DealHealthPage').then(m => ({ default: m.DealHealthPage })));
const DealHealthDetailPage = React.lazy(() => import('@/pages/deal-health/DealHealthDetailPage').then(m => ({ default: m.DealHealthDetailPage })));
const ReportsPage = React.lazy(() => import('@/pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AdminPage = React.lazy(() => import('@/pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const PricingPage = React.lazy(() => import('@/pages/admin/pricing/PricingPage').then(m => ({ default: m.PricingPage })));
const PricingRulesPage = React.lazy(() => import('@/pages/admin/pricing/PricingRulesPage').then(m => ({ default: m.PricingRulesPage })));
const CustomerTiersPage = React.lazy(() => import('@/pages/admin/pricing/CustomerTiersPage').then(m => ({ default: m.CustomerTiersPage })));
const UsersPage = React.lazy(() => import('@/pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));
const RolesPage = React.lazy(() => import('@/pages/admin/RolesPage').then(m => ({ default: m.RolesPage })));
const SettingsPage = React.lazy(() => import('@/pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = React.lazy(() => import('@/pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const AuditLogsPage = React.lazy(() => import('@/pages/audit/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const CustomerQuotePage = React.lazy(() => import('@/pages/portal').then(m => ({ default: m.CustomerQuotePage })));
const NegotiationPage = React.lazy(() => import('@/pages/portal').then(m => ({ default: m.NegotiationPage })));
const QuoteConfirmationPage = React.lazy(() => import('@/pages/portal').then(m => ({ default: m.QuoteConfirmationPage })));
import { NotFoundState } from '@/components/feedback/NotFoundState';

export const routes: RouteObject[] = [
  // Root Redirect
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },

  // Direct /login, /signup, and /verify-email routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // /dashboard shortcut redirect
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />,
  },

  // Shortcuts / Top-level redirects
  {
    path: '/quotations',
    element: <Navigate to="/app/quotations" replace />,
  },
  {
    path: '/quotations/new',
    element: <Navigate to="/app/quotations/new" replace />,
  },
  {
    path: '/quotations/:id',
    element: <QuotationRedirect />,
  },
  {
    path: '/approvals',
    element: <Navigate to="/app/approvals" replace />,
  },
  {
    path: '/approvals/:id',
    element: <ApprovalRedirect />,
  },
  {
    path: '/pipeline',
    element: <Navigate to="/app/pipeline" replace />,
  },
  {
    path: '/pipeline/:id',
    element: <PipelineRedirect />,
  },
  {
    path: '/fulfillment',
    element: <Navigate to="/app/fulfillment" replace />,
  },
  {
    path: '/fulfillment/:id',
    element: <FulfillmentRedirect />,
  },
  {
    path: '/warehouses',
    element: <Navigate to="/app/warehouses" replace />,
  },
  {
    path: '/warehouses/:id',
    element: <WarehouseRedirect />,
  },
  {
    path: '/billing',
    element: <Navigate to="/app/billing" replace />,
  },
  {
    path: '/invoices',
    element: <Navigate to="/app/invoices" replace />,
  },
  {
    path: '/invoices/:id',
    element: <InvoiceRedirect />,
  },
  {
    path: '/subscriptions',
    element: <Navigate to="/app/subscriptions" replace />,
  },
  {
    path: '/subscriptions/:id',
    element: <SubscriptionRedirect />,
  },
  {
    path: '/deal-health',
    element: <Navigate to="/app/deal-health" replace />,
  },
  {
    path: '/deal-health/:id',
    element: <DealHealthRedirect />,
  },
  {
    path: '/products',
    element: <Navigate to="/app/products" replace />,
  },
  {
    path: '/products/new',
    element: <Navigate to="/app/products/new" replace />,
  },
  {
    path: '/products/:id',
    element: <ProductRedirect />,
  },
  {
    path: '/admin',
    element: <Navigate to="/app/admin" replace />,
  },
  {
    path: '/admin/users',
    element: <Navigate to="/app/admin/users" replace />,
  },
  {
    path: '/admin/roles',
    element: <Navigate to="/app/admin/roles" replace />,
  },
  {
    path: '/admin/pricing',
    element: <Navigate to="/app/admin/pricing" replace />,
  },
  {
    path: '/admin/pricing/rules',
    element: <Navigate to="/app/admin/pricing/rules" replace />,
  },
  {
    path: '/admin/pricing/customer-tiers',
    element: <Navigate to="/app/admin/pricing/customer-tiers" replace />,
  },
  {
    path: '/admin/settings',
    element: <Navigate to="/app/admin/settings" replace />,
  },
  {
    path: '/reports',
    element: <Navigate to="/app/reports" replace />,
  },
  {
    path: '/notifications',
    element: <Navigate to="/app/notifications" replace />,
  },
  {
    path: '/audit-logs',
    element: <Navigate to="/app/audit-logs" replace />,
  },

  // Nested Auth Routes
  {
    path: '/auth',
    children: [
      {
        path: '',
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Internal App Routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <InternalLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'quotations',
        element: <QuotationsListPage />,
      },
      {
        path: 'quotations/new',
        element: <QuotationCreatePage />,
      },
      {
        path: 'quotations/:id',
        element: <QuotationDetailPage />,
      },
      {
        path: 'quotations/:id/approval',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE', 'SALES_REP']}>
            <QuotationApprovalPage />
          </RoleGuard>
        ),
      },
      {
        path: 'quotations/:id/fulfillment',
        element: <QuotationFulfillmentPage />,
      },
      {
        path: 'quotations/:id/billing',
        element: <QuotationBillingPage />,
      },
      {
        path: 'pipeline',
        element: <PipelinePage />,
      },
      {
        path: 'pipeline/:dealId',
        element: <DealDetailPage />,
      },
      {
        path: 'approvals',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE', 'SALES_REP']}>
            <ApprovalsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'approvals/:id',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE', 'SALES_REP']}>
            <ApprovalDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/new',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <NewProductPage />
          </RoleGuard>
        ),
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'products/:productId/edit',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER']}>
            <EditProductPage />
          </RoleGuard>
        ),
      },
      {
        path: 'warehouses',
        element: (
          <RoleGuard roles={['ADMIN', 'WAREHOUSE_OPS', 'SALES_MANAGER', 'SALES_REP', 'FINANCE']}>
            <WarehousesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'warehouses/:warehouseId',
        element: (
          <RoleGuard roles={['ADMIN', 'WAREHOUSE_OPS', 'SALES_MANAGER', 'SALES_REP', 'FINANCE']}>
            <WarehouseDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'fulfillment',
        element: (
          <RoleGuard roles={['ADMIN', 'WAREHOUSE_OPS', 'SALES_MANAGER', 'SALES_REP', 'FINANCE']}>
            <FulfillmentPage />
          </RoleGuard>
        ),
      },
      {
        path: 'fulfillment/:fulfillmentId',
        element: (
          <RoleGuard roles={['ADMIN', 'WAREHOUSE_OPS', 'SALES_MANAGER', 'SALES_REP', 'FINANCE']}>
            <FulfillmentDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'billing',
        element: (
          <RoleGuard roles={['ADMIN', 'FINANCE']}>
            <BillingPage />
          </RoleGuard>
        ),
      },
      {
        path: 'invoices',
        element: (
          <RoleGuard roles={['ADMIN', 'FINANCE', 'SALES_REP', 'SALES_MANAGER']}>
            <InvoicesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'invoices/:invoiceId',
        element: (
          <RoleGuard roles={['ADMIN', 'FINANCE', 'SALES_REP', 'SALES_MANAGER']}>
            <InvoiceDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <RoleGuard roles={['ADMIN', 'FINANCE']}>
            <SubscriptionsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'subscriptions/:subscriptionId',
        element: (
          <RoleGuard roles={['ADMIN', 'FINANCE']}>
            <SubscriptionDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'deal-health',
        element: <DealHealthPage />,
      },
      {
        path: 'deal-health/:dealId',
        element: <DealHealthDetailPage />,
      },
      {
        path: 'reports',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
            <ReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
            <AdminPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/pricing',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
            <PricingPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/pricing/rules',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
            <PricingRulesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/pricing/customer-tiers',
        element: (
          <RoleGuard roles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
            <CustomerTiersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RoleGuard roles={['ADMIN']}>
            <UsersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <RoleGuard roles={['ADMIN']}>
            <RolesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/settings',
        element: (
          <RoleGuard roles={['ADMIN']}>
            <SettingsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
    ],
  },

  // Customer Portal Routes (Strictly separated)
  {
    path: '/portal',
    element: <CustomerPortalLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/portal/quote/portal_acme_1042" replace />,
      },
      {
        path: 'quote/:token',
        element: <CustomerQuotePage />,
      },
      {
        path: 'quote/:token/negotiate',
        element: <NegotiationPage />,
      },
      {
        path: 'quote/:token/confirmation',
        element: <QuoteConfirmationPage />,
      },
    ],
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <NotFoundState />,
  },
];

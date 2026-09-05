import { Role, Permission } from '@/types';
import { ROUTES } from '@/constants/routes';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Users,
  Package,
  Truck,
  CreditCard,
  Repeat,
  HeartPulse,
  BarChart3,
  Settings,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
  requiredPermissions: Permission[];
  roles: Role[];
}

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    route: ROUTES.APP.DASHBOARD,
    requiredPermissions: [],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'WAREHOUSE_OPS'],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    icon: FileText,
    route: ROUTES.APP.QUOTATIONS,
    badge: 'Live',
    requiredPermissions: ['quotations:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'WAREHOUSE_OPS'],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: TrendingUp,
    route: ROUTES.APP.PIPELINE,
    requiredPermissions: ['quotations:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP'],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    route: ROUTES.APP.CUSTOMERS,
    requiredPermissions: ['customers:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP'],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    route: ROUTES.APP.PRODUCTS,
    requiredPermissions: ['products:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP'],
  },
  {
    id: 'fulfillment',
    label: 'Fulfillment',
    icon: Truck,
    route: ROUTES.APP.FULFILLMENT,
    requiredPermissions: ['inventory:read'],
    roles: ['ADMIN', 'WAREHOUSE_OPS'],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    route: ROUTES.APP.BILLING,
    requiredPermissions: ['billing:manage'],
    roles: ['ADMIN', 'FINANCE'],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: Repeat,
    route: ROUTES.APP.SUBSCRIPTIONS,
    requiredPermissions: ['subscriptions:manage'],
    roles: ['ADMIN', 'FINANCE'],
  },
  {
    id: 'deal-health',
    label: 'Deal Health',
    icon: HeartPulse,
    route: ROUTES.APP.DEAL_HEALTH,
    badge: 'AI',
    requiredPermissions: ['quotations:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'SALES_REP'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    route: ROUTES.APP.REPORTS,
    requiredPermissions: ['reports:read'],
    roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    route: ROUTES.APP.ADMIN,
    requiredPermissions: ['admin:settings'],
    roles: ['ADMIN'],
  },
];

/**
 * Filter navigation items strictly based on role and active permissions
 */
export function getFilteredNavigation(
  role: Role | null,
  userPermissions: Permission[] = []
): NavigationItem[] {
  if (!role || role === 'CUSTOMER') return [];

  return NAVIGATION.filter((item) => {
    // 1. Check role list
    const roleAllowed = item.roles.includes(role);
    if (!roleAllowed) return false;

    // 2. Check permission if any required
    if (item.requiredPermissions.length === 0) return true;
    return item.requiredPermissions.some((perm) => userPermissions.includes(perm));
  });
}

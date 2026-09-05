import { Role, Permission } from '@/types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'quotations:read',
    'quotations:create',
    'quotations:edit',
    'quotations:delete',
    'quotations:approve',
    'quotations:send',
    'approvals:manage',
    'customers:read',
    'customers:write',
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:allocate',
    'billing:manage',
    'subscriptions:manage',
    'reports:read',
    'admin:settings',
    'portal:access',
  ],
  SALES_MANAGER: [
    'quotations:read',
    'quotations:create',
    'quotations:edit',
    'quotations:approve',
    'quotations:send',
    'approvals:manage',
    'customers:read',
    'products:read',
    'inventory:read',
    'reports:read',
  ],
  SALES_REP: [
    'quotations:read',
    'quotations:create',
    'quotations:edit',
    'quotations:send',
    'customers:read',
    'products:read',
  ],
  WAREHOUSE_OPS: [
    'inventory:read',
    'inventory:allocate',
    'quotations:read',
  ],
  FINANCE: [
    'billing:manage',
    'subscriptions:manage',
    'reports:read',
    'quotations:read',
    'quotations:approve',
  ],
  CUSTOMER: [
    'portal:access',
  ],
};

export function canAccess(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

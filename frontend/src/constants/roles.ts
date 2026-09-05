import { Role, User } from '@/types';

export const USER_ROLES = {
  ADMIN: 'ADMIN' as Role,
  SALES_MANAGER: 'SALES_MANAGER' as Role,
  SALES_REP: 'SALES_REP' as Role,
  WAREHOUSE_OPS: 'WAREHOUSE_OPS' as Role,
  FINANCE: 'FINANCE' as Role,
  CUSTOMER: 'CUSTOMER' as Role,
};

// Demo mock users available for rapid testing/switching during hackathon presentation
export const DEMO_USERS: Record<Role, User> = {
  SALES_REP: {
    id: 'usr_rep_1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@dealflow360.internal',
    role: 'SALES_REP',
    department: 'Enterprise Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    permissions: ['quotations:read', 'quotations:create', 'quotations:edit', 'quotations:send', 'customers:read', 'products:read'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  SALES_MANAGER: {
    id: 'usr_mgr_1',
    name: 'Marcus Vance',
    email: 'marcus.vance@dealflow360.internal',
    role: 'SALES_MANAGER',
    department: 'Sales Leadership',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    permissions: ['quotations:read', 'quotations:approve', 'approvals:manage', 'customers:read', 'reports:read'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  ADMIN: {
    id: 'usr_adm_1',
    name: 'Elena Rostova',
    email: 'elena.rostova@dealflow360.internal',
    role: 'ADMIN',
    department: 'Operations & IT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    permissions: [
      'quotations:read', 'quotations:create', 'quotations:edit', 'quotations:delete', 'quotations:approve',
      'customers:read', 'customers:write', 'products:read', 'products:write',
      'inventory:read', 'inventory:allocate', 'billing:manage', 'subscriptions:manage',
      'reports:read', 'admin:settings'
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  WAREHOUSE_OPS: {
    id: 'usr_wh_1',
    name: 'Devon Lee',
    email: 'devon.lee@dealflow360.internal',
    role: 'WAREHOUSE_OPS',
    department: 'Logistics',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    permissions: ['inventory:read', 'inventory:allocate', 'quotations:read'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  FINANCE: {
    id: 'usr_fin_1',
    name: 'Rachel Sterling',
    email: 'rachel.sterling@dealflow360.internal',
    role: 'FINANCE',
    department: 'Finance & Treasury',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    permissions: ['billing:manage', 'subscriptions:manage', 'reports:read', 'quotations:read'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  CUSTOMER: {
    id: 'usr_cust_1',
    name: 'Acme Corp (David Kim)',
    email: 'david@acme-corp.com',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    permissions: ['portal:access'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

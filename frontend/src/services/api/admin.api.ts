import {
  AdminUser,
  Role,
  RolePermissionConfig,
  SystemSettings,
  AuditActivityItem,
  PermissionModule,
  PermissionAction,
} from '@/types';

const USERS_STORAGE_KEY = 'dealflow_admin_users_v2';
const ROLES_STORAGE_KEY = 'dealflow_roles_permissions_v2';
const SETTINGS_STORAGE_KEY = 'dealflow_system_settings_v2';
const AUDIT_STORAGE_KEY = 'dealflow_audit_activity_v2';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user_alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@dealflow360.com',
    role: 'SALES_REP',
    status: 'ACTIVE',
    department: 'Commercial Sales',
    phone: '+1 (555) 234-5678',
    lastLoginAt: '2026-03-05T08:15:00Z',
    createdAt: '2026-01-02T09:00:00Z',
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@dealflow360.com',
    role: 'SALES_MANAGER',
    status: 'ACTIVE',
    department: 'Sales Leadership',
    phone: '+1 (555) 345-6789',
    lastLoginAt: '2026-03-05T08:45:00Z',
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 'user_david',
    name: 'David Chen',
    email: 'david.chen@dealflow360.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'System Architecture & Operations',
    phone: '+1 (555) 901-2345',
    lastLoginAt: '2026-03-05T09:12:00Z',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.r@dealflow360.com',
    role: 'FINANCE',
    status: 'ACTIVE',
    department: 'Financial Planning & Analysis',
    phone: '+1 (555) 456-7890',
    lastLoginAt: '2026-03-04T16:30:00Z',
    createdAt: '2025-12-01T11:00:00Z',
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@dealflow360.com',
    role: 'WAREHOUSE_OPS',
    status: 'ACTIVE',
    department: 'Supply Chain & Logistics',
    phone: '+1 (555) 678-9012',
    lastLoginAt: '2026-03-05T07:20:00Z',
    createdAt: '2026-01-10T08:30:00Z',
  },
  {
    id: 'user_john_cust',
    name: 'John Doe',
    email: 'john.doe@acme.org',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    department: 'Acme Corp Procurement',
    phone: '+1 (555) 789-0123',
    lastLoginAt: '2026-03-04T14:10:00Z',
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'user_priya',
    name: 'Priya Nair',
    email: 'priya.nair@dealflow360.com',
    role: 'SALES_REP',
    status: 'ACTIVE',
    department: 'Commercial Sales',
    phone: '+1 (555) 890-1234',
    lastLoginAt: '2026-03-05T06:55:00Z',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'user_liam',
    name: 'Liam Wilson',
    email: 'liam.w@dealflow360.com',
    role: 'WAREHOUSE_OPS',
    status: 'INACTIVE',
    department: 'East Depot Operations',
    phone: '+1 (555) 901-3456',
    lastLoginAt: '2026-02-18T10:15:00Z',
    createdAt: '2026-01-22T09:30:00Z',
  },
];

export const INITIAL_ROLE_CONFIGS: RolePermissionConfig[] = [
  {
    role: 'ADMIN',
    roleName: 'System Administrator',
    description: 'Complete operational authority across product catalogs, rules, security, and users.',
    userCount: 1,
    isSystem: true,
    permissions: {
      quotations: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      approvals: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      pipeline: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      fulfillment: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      invoicing: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      products: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      pricing: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      admin: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    },
  },
  {
    role: 'SALES_MANAGER',
    roleName: 'Sales Operations Manager',
    description: 'Direct team pipeline supervision, quotation discount review, and margin oversight.',
    userCount: 1,
    isSystem: true,
    permissions: {
      quotations: ['view', 'create', 'edit', 'approve', 'export'],
      approvals: ['view', 'approve', 'export'],
      pipeline: ['view', 'create', 'edit', 'export'],
      fulfillment: ['view'],
      invoicing: ['view'],
      products: ['view'],
      pricing: ['view'],
      admin: ['view'],
    },
  },
  {
    role: 'SALES_REP',
    roleName: 'Sales Representative',
    description: 'Opportunity generation, quote drafting within discount boundaries, and customer negotiation.',
    userCount: 2,
    isSystem: true,
    permissions: {
      quotations: ['view', 'create', 'edit'],
      approvals: ['view'],
      pipeline: ['view', 'create', 'edit'],
      fulfillment: ['view'],
      invoicing: ['view'],
      products: ['view'],
      pricing: ['view'],
      admin: [],
    },
  },
  {
    role: 'FINANCE',
    roleName: 'Finance Director / Controller',
    description: 'Enforcement of gross margin floors, credit terms, high-risk quotes signoff, and invoicing.',
    userCount: 1,
    isSystem: true,
    permissions: {
      quotations: ['view', 'approve', 'export'],
      approvals: ['view', 'approve', 'export'],
      pipeline: ['view'],
      fulfillment: ['view'],
      invoicing: ['view', 'create', 'edit', 'export'],
      products: ['view'],
      pricing: ['view', 'edit', 'export'],
      admin: ['view'],
    },
  },
  {
    role: 'WAREHOUSE_OPS',
    roleName: 'Logistics & Warehouse Ops',
    description: 'Inventory stock management, warehouse bin allocation, and physical dispatch verification.',
    userCount: 2,
    isSystem: true,
    permissions: {
      quotations: ['view'],
      approvals: [],
      pipeline: [],
      fulfillment: ['view', 'create', 'edit'],
      invoicing: [],
      products: ['view'],
      pricing: [],
      admin: [],
    },
  },
  {
    role: 'CUSTOMER',
    roleName: 'External Customer Contact',
    description: 'Isolated access to customer negotiation portal, quote review, and acceptance.',
    userCount: 1,
    isSystem: true,
    permissions: {
      quotations: ['view'],
      approvals: [],
      pipeline: [],
      fulfillment: [],
      invoicing: [],
      products: [],
      pricing: [],
      admin: [],
    },
  },
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  general: {
    companyName: 'DealFlow360 Enterprise Systems',
    companyEmail: 'operations@dealflow360.com',
    baseCurrency: 'USD ($)',
    defaultTaxRatePct: 18,
    fiscalYearStart: 'January 1st',
  },
  pricingAndApprovals: {
    strictFloorEnforcement: true,
    autoApprovalTimeoutHours: 24,
    maxAllowedDiscountCeiling: 25,
    requireFinanceForHighRisk: true,
    requireMultiLevelAboveValue: 50000,
  },
  notifications: {
    emailAlertsEnabled: true,
    inAppToastEnabled: true,
    slackWebhookUrl: 'https://hooks.slack.com/services/T00/B00/dealflow-alerts',
    digestFrequency: 'DAILY',
  },
  security: {
    sessionTimeoutMinutes: 60,
    mfaEnforced: true,
    auditLogRetentionDays: 365,
    ipAllowlistEnabled: false,
  },
};

export const INITIAL_AUDIT_LOG: AuditActivityItem[] = [
  {
    id: 'aud_1',
    actorName: 'David Chen',
    actorEmail: 'david.chen@dealflow360.com',
    actorRole: 'ADMIN',
    action: 'UPDATED_PRICING_RULE',
    module: 'Pricing',
    target: 'RULE-TIER-GLD-15 (Gold Tier Dual Signoff Protocol)',
    timestamp: '2026-03-05T09:15:00Z',
    ipAddress: '192.168.1.104',
    details: 'Adjusted trigger threshold from 12% to 10% for finance routing.',
  },
  {
    id: 'aud_2',
    actorName: 'David Chen',
    actorEmail: 'david.chen@dealflow360.com',
    actorRole: 'ADMIN',
    action: 'TOGGLED_USER_STATUS',
    module: 'Users',
    target: 'Liam Wilson (WAREHOUSE_OPS)',
    timestamp: '2026-03-04T15:30:00Z',
    ipAddress: '192.168.1.104',
    details: 'Changed account status to INACTIVE due to scheduled leave.',
  },
  {
    id: 'aud_3',
    actorName: 'Elena Rostova',
    actorEmail: 'elena.r@dealflow360.com',
    actorRole: 'FINANCE',
    action: 'VERIFIED_MARGIN_FLOOR',
    module: 'Pricing',
    target: 'RULE-MARGIN-HW-20',
    timestamp: '2026-03-04T11:20:00Z',
    ipAddress: '192.168.1.112',
    details: 'Audited gross margin compliance across physical workstation inventory.',
  },
  {
    id: 'aud_4',
    actorName: 'Sarah Jenkins',
    actorEmail: 'sarah.j@dealflow360.com',
    actorRole: 'SALES_MANAGER',
    action: 'OVERRIDE_APPROVED',
    module: 'Approvals',
    target: 'Quote Q-2026-003 ($34,500)',
    timestamp: '2026-03-03T16:45:00Z',
    ipAddress: '192.168.1.108',
    details: 'Approved 12.5% discount for Nexus Enterprise renewal.',
  },
];

function getStoredUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
      return INITIAL_ADMIN_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADMIN_USERS;
  }
}

function saveStoredUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

function getStoredRoles(): RolePermissionConfig[] {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(INITIAL_ROLE_CONFIGS));
      return INITIAL_ROLE_CONFIGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ROLE_CONFIGS;
  }
}

function saveStoredRoles(roles: RolePermissionConfig[]): void {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (err) {
    console.error('Failed to save roles:', err);
  }
}

function getStoredSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_SETTINGS));
      return INITIAL_SYSTEM_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SYSTEM_SETTINGS;
  }
}

function saveStoredSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

function getStoredAuditLog(): AuditActivityItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOG));
      return INITIAL_AUDIT_LOG;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOG;
  }
}

function recordAudit(action: string, module: string, target: string, details?: string): void {
  try {
    const log = getStoredAuditLog();
    const newEntry: AuditActivityItem = {
      id: `aud_${Date.now()}`,
      actorName: 'David Chen',
      actorEmail: 'david.chen@dealflow360.com',
      actorRole: 'ADMIN',
      action,
      module,
      target,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Session Admin)',
      details,
    };
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([newEntry, ...log]));
  } catch (e) {
    console.error('Audit log write error:', e);
  }
}

export const adminApi = {
  async getUsers(): Promise<AdminUser[]> {
    return getStoredUsers();
  },

  async getUserById(id: string): Promise<AdminUser | null> {
    const users = getStoredUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser(payload: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    const users = getStoredUsers();
    const newUser: AdminUser = {
      ...payload,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: undefined,
    };

    const updated = [newUser, ...users];
    saveStoredUsers(updated);
    recordAudit('CREATED_USER', 'Users', `${newUser.name} (${newUser.role})`);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User with ID ${id} not found`);

    const updatedUser: AdminUser = {
      ...users[idx],
      ...updates,
    };

    users[idx] = updatedUser;
    saveStoredUsers(users);
    recordAudit('UPDATED_USER', 'Users', `${updatedUser.name} (${updatedUser.role})`);
    return updatedUser;
  },

  async toggleUserStatus(id: string): Promise<AdminUser> {
    const users = getStoredUsers();
    const target = users.find((u) => u.id === id);
    if (!target) throw new Error(`User ${id} not found`);

    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return adminApi.updateUser(id, { status: nextStatus });
  },

  async getRolePermissions(): Promise<RolePermissionConfig[]> {
    return getStoredRoles();
  },

  async updateRolePermissions(
    role: Role,
    permissions: Record<PermissionModule, PermissionAction[]>
  ): Promise<RolePermissionConfig> {
    const roles = getStoredRoles();
    const idx = roles.findIndex((r) => r.role === role);
    if (idx === -1) throw new Error(`Role config for ${role} not found`);

    const updatedConfig: RolePermissionConfig = {
      ...roles[idx],
      permissions,
    };

    roles[idx] = updatedConfig;
    saveStoredRoles(roles);
    recordAudit('UPDATED_ROLE_PERMISSIONS', 'Roles', `Permissions updated for ${roles[idx].roleName}`);
    return updatedConfig;
  },

  async getSettings(): Promise<SystemSettings> {
    return getStoredSettings();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = getStoredSettings();
    const updated: SystemSettings = {
      general: { ...current.general, ...(settings.general || {}) },
      pricingAndApprovals: { ...current.pricingAndApprovals, ...(settings.pricingAndApprovals || {}) },
      notifications: { ...current.notifications, ...(settings.notifications || {}) },
      security: { ...current.security, ...(settings.security || {}) },
    };

    saveStoredSettings(updated);
    recordAudit('UPDATED_SYSTEM_SETTINGS', 'Settings', 'Global system configuration parameters saved');
    return updated;
  },

  async getAuditLog(): Promise<AuditActivityItem[]> {
    return getStoredAuditLog();
  },
};

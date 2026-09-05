import { Role } from './auth.types';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  avatarUrl?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export type PermissionModule =
  | 'quotations'
  | 'approvals'
  | 'pipeline'
  | 'fulfillment'
  | 'invoicing'
  | 'products'
  | 'pricing'
  | 'admin';

export interface RolePermissionConfig {
  role: Role;
  roleName: string;
  description: string;
  userCount: number;
  permissions: Record<PermissionModule, PermissionAction[]>;
  isSystem: boolean;
}

export interface SystemGeneralSettings {
  companyName: string;
  companyEmail: string;
  baseCurrency: string;
  defaultTaxRatePct: number;
  fiscalYearStart: string;
}

export interface SystemPricingSettings {
  strictFloorEnforcement: boolean;
  autoApprovalTimeoutHours: number;
  maxAllowedDiscountCeiling: number;
  requireFinanceForHighRisk: boolean;
  requireMultiLevelAboveValue: number;
}

export interface SystemNotificationSettings {
  emailAlertsEnabled: boolean;
  inAppToastEnabled: boolean;
  slackWebhookUrl?: string;
  digestFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY';
}

export interface SystemSecuritySettings {
  sessionTimeoutMinutes: number;
  mfaEnforced: boolean;
  auditLogRetentionDays: number;
  ipAllowlistEnabled: boolean;
}

export interface SystemSettings {
  general: SystemGeneralSettings;
  pricingAndApprovals: SystemPricingSettings;
  notifications: SystemNotificationSettings;
  security: SystemSecuritySettings;
}

export interface AuditActivityItem {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: Role;
  action: string;
  module: string;
  target: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

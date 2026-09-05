export type AuditAction =
  | 'QUOTE_CREATED'
  | 'QUOTE_UPDATED'
  | 'QUOTE_SUBMITTED'
  | 'QUOTE_APPROVED'
  | 'QUOTE_REJECTED'
  | 'QUOTE_RETURNED'
  | 'DEAL_CREATED'
  | 'DEAL_STAGE_CHANGED'
  | 'DEAL_OWNER_REASSIGNED'
  | 'DEAL_NOTE_ADDED'
  | 'STOCK_ALLOCATED'
  | 'SHIPMENT_DISPATCHED'
  | 'INVOICE_GENERATED'
  | 'PAYMENT_RECORDED'
  | 'RULE_CREATED'
  | 'RULE_UPDATED'
  | 'TIER_MODIFIED'
  | 'USER_PROVISIONED'
  | 'PERMISSIONS_MODIFIED'
  | 'SETTINGS_UPDATED';

export interface AuditFieldDiff {
  field: string;
  label: string;
  before: any;
  after: any;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  timestamp: string;
  description: string;
  ipAddress?: string;
  source?: string;
  diffs?: AuditFieldDiff[];
}

export interface AuditLogFilterOptions {
  search?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateRange?: string;
}

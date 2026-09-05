import { AuditLogEntry, AuditLogFilterOptions } from '@/types';

const AUDIT_STORAGE_KEY = 'dealflow_audit_logs_v2';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_101',
    action: 'QUOTE_SUBMITTED',
    entityType: 'Quotation',
    entityId: 'quote_1001',
    entityName: 'Quote Q-1042 (Acme Corporation)',
    userId: 'user_alex',
    userName: 'Alex Morgan',
    userRole: 'SALES_REP',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    description: 'Submitted quotation for approval with 22% requested discount on ProLaptop X1 workstations.',
    ipAddress: '192.168.1.45',
    source: 'Quotation Workspace',
    diffs: [
      { field: 'status', label: 'Quote Status', before: 'DRAFT', after: 'PENDING_APPROVAL' },
      { field: 'discount', label: 'Overall Discount', before: '10%', after: '22%' },
      { field: 'margin', label: 'Gross Margin', before: '28.4%', after: '13.2%' },
    ],
  },
  {
    id: 'aud_102',
    action: 'DEAL_STAGE_CHANGED',
    entityType: 'Deal',
    entityId: 'deal-104',
    entityName: 'OmniCorp Global Enterprise Suite',
    userId: 'user_sarah',
    userName: 'Sarah Jenkins',
    userRole: 'SALES_MANAGER',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    description: 'Advanced deal stage to Negotiation following executive demo and budget validation.',
    ipAddress: '192.168.1.108',
    source: 'Pipeline Kanban',
    diffs: [
      { field: 'stage', label: 'Pipeline Stage', before: 'Proposal', after: 'Negotiation' },
      { field: 'probability', label: 'Win Probability', before: '60%', after: '75%' },
    ],
  },
  {
    id: 'aud_103',
    action: 'RULE_UPDATED',
    entityType: 'PricingRule',
    entityId: 'rule_gold_dual',
    entityName: 'RULE-TIER-GLD-15 (Gold Tier Dual Signoff Protocol)',
    userId: 'user_david',
    userName: 'David Chen',
    userRole: 'ADMIN',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Updated auto-approval ceiling threshold from 12% to 10% for Gold customer tier.',
    ipAddress: '192.168.1.104',
    source: 'Admin Pricing Hub',
    diffs: [
      { field: 'action.value', label: 'Approval Trigger Value', before: '12%', after: '10%' },
      { field: 'requireApprovalRole', label: 'Mandatory Approver', before: 'SALES_MANAGER', after: 'FINANCE' },
    ],
  },
  {
    id: 'aud_104',
    action: 'STOCK_ALLOCATED',
    entityType: 'Fulfillment',
    entityId: 'ful-104',
    entityName: 'Order FUL-2026-004 (NovaTech Supplies)',
    userId: 'user_marcus',
    userName: 'Marcus Vance',
    userRole: 'WAREHOUSE_OPS',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Allocated 25 workstations from Mumbai Main Hub and backordered 12 units from East Depot.',
    ipAddress: '192.168.1.140',
    source: 'Fulfillment Workspace',
    diffs: [
      { field: 'allocatedUnits', label: 'Allocated Stock Units', before: '0', after: '25' },
      { field: 'status', label: 'Fulfillment State', before: 'PENDING_ALLOCATION', after: 'ALLOCATED' },
    ],
  },
  {
    id: 'aud_105',
    action: 'PAYMENT_RECORDED',
    entityType: 'Invoice',
    entityId: 'inv-001',
    entityName: 'Invoice INV-2026-001 ($42,500)',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userRole: 'FINANCE',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    description: 'Recorded wire receipt of $42,500 via Citibank HDFC UTR# 994821882.',
    ipAddress: '192.168.1.112',
    source: 'Invoices & Billing',
    diffs: [
      { field: 'paidAmount', label: 'Reconciled Amount', before: '$0', after: '$42,500' },
      { field: 'balanceDue', label: 'Remaining Balance', before: '$42,500', after: '$0' },
      { field: 'paymentStatus', label: 'Invoice Status', before: 'OVERDUE', after: 'PAID' },
    ],
  },
  {
    id: 'aud_106',
    action: 'QUOTE_APPROVED',
    entityType: 'Approval',
    entityId: 'appr_1003',
    entityName: 'Quote Q-1035 (PeakSoft Ltd)',
    userId: 'user_sarah',
    userName: 'Sarah Jenkins',
    userRole: 'SALES_MANAGER',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: 'Approved 15% discount for 100-seat CloudBase Pro renewal.',
    ipAddress: '192.168.1.108',
    source: 'Approval Center',
    diffs: [
      { field: 'status', label: 'Approval Status', before: 'PENDING', after: 'APPROVED' },
    ],
  },
  {
    id: 'aud_107',
    action: 'SETTINGS_UPDATED',
    entityType: 'SystemSettings',
    entityId: 'settings_global',
    entityName: 'DealFlow360 Enterprise Governance',
    userId: 'user_david',
    userName: 'David Chen',
    userRole: 'ADMIN',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    description: 'Enforced Mandatory MFA authentication for all Sales Manager and Finance user roles.',
    ipAddress: '192.168.1.104',
    source: 'Admin Settings',
    diffs: [
      { field: 'security.mfaEnforced', label: 'MFA Enforcement', before: 'false', after: 'true' },
      { field: 'security.sessionTimeoutMinutes', label: 'Idle Timeout', before: '120m', after: '60m' },
    ],
  },
];

function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

function saveStoredAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save audit logs:', err);
  }
}

export const auditApi = {
  async getAuditLogs(filters?: AuditLogFilterOptions): Promise<AuditLogEntry[]> {
    const logs = getStoredAuditLogs();
    if (!filters) return logs;

    const q = (filters.search || '').toLowerCase().trim();

    return logs.filter((entry) => {
      const matchesSearch =
        !q ||
        entry.entityName.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.userName.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q);

      const matchesUser = !filters.userId || filters.userId === 'ALL' || entry.userId === filters.userId;
      const matchesAction = !filters.action || filters.action === 'ALL' || entry.action === filters.action;
      const matchesEntityType =
        !filters.entityType || filters.entityType === 'ALL' || entry.entityType.toLowerCase() === filters.entityType.toLowerCase();
      const matchesEntityId = !filters.entityId || entry.entityId === filters.entityId;

      return matchesSearch && matchesUser && matchesAction && matchesEntityType && matchesEntityId;
    });
  },

  async getAuditLog(id: string): Promise<AuditLogEntry | null> {
    const logs = getStoredAuditLogs();
    return logs.find((e) => e.id === id) || null;
  },

  async getEntityAuditLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const logs = getStoredAuditLogs();
    return logs.filter(
      (e) =>
        e.entityType.toLowerCase() === entityType.toLowerCase() &&
        e.entityId.toLowerCase() === entityId.toLowerCase()
    );
  },

  async recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const logs = getStoredAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || '127.0.0.1 (Local Session)',
      source: entry.source || 'DealFlow360 Web Client',
    };

    const updated = [newEntry, ...logs];
    saveStoredAuditLogs(updated);
    return newEntry;
  },
};

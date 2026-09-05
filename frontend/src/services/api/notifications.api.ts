import {
  NotificationItem,
  NotificationFilterOptions,
  NotificationPreferences,
} from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'dealflow_notifications_v2';
const PREFERENCES_STORAGE_KEY = 'dealflow_notif_prefs_v2';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'APPROVAL_REQUIRED',
    priority: 'HIGH',
    title: 'Finance Clearance Required',
    message: 'Quote Q-1042 for Acme Corporation requires Finance Director signoff due to 22% discount breach.',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m ago
    entityType: 'approval',
    entityId: 'appr_1001',
    route: '/app/approvals/appr_1001',
    actorName: 'Alex Morgan',
    actorRole: 'Sales Rep',
  },
  {
    id: 'notif_2',
    type: 'DEAL_RISK_INCREASED',
    priority: 'HIGH',
    title: 'Deal Risk Escalated to Critical',
    message: 'OmniCorp Global deal health score dropped to 34/100. Dormant for 14 days with margin compression.',
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25m ago
    entityType: 'deal',
    entityId: 'deal-104',
    route: '/app/deal-health/deal-104',
    actorName: 'Deal Health Monitor',
    actorRole: 'System Sensor',
  },
  {
    id: 'notif_3',
    type: 'NEGOTIATION_REQUESTED',
    priority: 'MEDIUM',
    title: 'Customer Counter-Offer Submitted',
    message: 'Acme Corp requested price adjustment on ProLaptop X1 (target $1,050/unit) via Customer Portal.',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45m ago
    entityType: 'quotation',
    entityId: 'quote_1001',
    route: '/portal/quote/portal_acme_1042/negotiate',
    actorName: 'John Doe',
    actorRole: 'Acme Procurement',
  },
  {
    id: 'notif_4',
    type: 'PAYMENT_RECEIVED',
    priority: 'LOW',
    title: 'Invoice Payment Settled',
    message: 'Wire payment of $42,500 reconciled for INV-2026-001 (Acme Corporation). Balance zero.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    entityType: 'invoice',
    entityId: 'inv-001',
    route: '/app/invoices/inv-001',
    actorName: 'Elena Rostova',
    actorRole: 'Finance Director',
  },
  {
    id: 'notif_5',
    type: 'QUOTE_ACCEPTED',
    priority: 'LOW',
    title: 'Quotation Q-1034 Legally Signed',
    message: 'Quantum Dynamics Tech accepted proposal and signed online contract ($67,800).',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    entityType: 'quotation',
    entityId: 'quote_1006',
    route: '/app/quotations/quote_1006',
    actorName: 'Dr. Aris Thorne',
    actorRole: 'Customer VP',
  },
  {
    id: 'notif_6',
    type: 'DEAL_STALLED',
    priority: 'MEDIUM',
    title: 'Vertex LLC Velocity Alert',
    message: 'No client touchpoint detected in 9 days. Deal stage: Negotiation. $91,000 at risk.',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    entityType: 'deal',
    entityId: 'deal-102',
    route: '/app/pipeline/deal-102',
    actorName: 'Pipeline Telemetry',
    actorRole: 'System',
  },
  {
    id: 'notif_7',
    type: 'SHIPMENT_UPDATED',
    priority: 'LOW',
    title: 'Carrier Dispatch Confirmed',
    message: 'Fulfillment order FUL-2026-004 handed over to BlueDart Express. Tracking: BD-88219482.',
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    entityType: 'fulfillment',
    entityId: 'ful-104',
    route: '/app/fulfillment/ful-104',
    actorName: 'Marcus Vance',
    actorRole: 'Warehouse Ops',
  },
  {
    id: 'notif_8',
    type: 'SYSTEM_NOTIFICATION',
    priority: 'LOW',
    title: 'Governance Floor Rule Updated',
    message: 'Hardware gross margin floor confirmed at 20% by Administrator David Chen.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
    entityType: 'system',
    entityId: 'rule_hw_margin',
    route: '/app/admin/pricing/rules',
    actorName: 'David Chen',
    actorRole: 'Admin',
  },
];

export const INITIAL_PREFERENCES: NotificationPreferences = {
  email: {
    approvalRequired: true,
    quoteApproved: true,
    quoteRejected: true,
    dealRiskIncreased: true,
    dealStalled: false,
    invoiceOverdue: true,
    paymentReceived: true,
    customerNegotiation: true,
  },
  inApp: {
    approvalRequired: true,
    quoteApproved: true,
    quoteRejected: true,
    dealRiskIncreased: true,
    dealStalled: true,
    invoiceOverdue: true,
    paymentReceived: true,
    customerNegotiation: true,
  },
  digestFrequency: 'DAILY',
};

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredNotifications(items: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

function getStoredPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(INITIAL_PREFERENCES));
      return INITIAL_PREFERENCES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PREFERENCES;
  }
}

function saveStoredPreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save notification preferences:', err);
  }
}

export const notificationsApi = {
  async getNotifications(filters?: NotificationFilterOptions): Promise<NotificationItem[]> {
    const items = getStoredNotifications();
    if (!filters) return items;

    const q = (filters.search || '').toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.actorName?.toLowerCase().includes(q);

      const matchesRead = filters.isRead === undefined || item.isRead === filters.isRead;
      const matchesPriority =
        !filters.priority || filters.priority === 'ALL' || item.priority === filters.priority;
      const matchesType = !filters.type || filters.type === 'ALL' || item.type === filters.type;

      let matchesCategory = true;
      if (filters.category && filters.category !== 'ALL') {
        if (filters.category === 'UNREAD') {
          matchesCategory = !item.isRead;
        } else if (filters.category === 'APPROVALS') {
          matchesCategory = item.type.includes('APPROVAL');
        } else if (filters.category === 'RISK') {
          matchesCategory = item.type.includes('RISK') || item.type.includes('STALLED');
        } else if (filters.category === 'FINANCE') {
          matchesCategory = item.type.includes('INVOICE') || item.type.includes('PAYMENT');
        } else if (filters.category === 'SYSTEM') {
          matchesCategory = item.type.includes('SYSTEM') || item.type.includes('FULFILLMENT');
        }
      }

      return matchesSearch && matchesRead && matchesPriority && matchesType && matchesCategory;
    });
  },

  async getUnreadCount(): Promise<number> {
    const items = getStoredNotifications();
    return items.filter((n) => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const items = getStoredNotifications();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error(`Notification ${id} not found`);

    items[idx] = { ...items[idx], isRead: true };
    saveStoredNotifications(items);
    return items[idx];
  },

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    const items = getStoredNotifications();
    const updated = items.map((n) => ({ ...n, isRead: true }));
    saveStoredNotifications(updated);
    return { success: true, count: updated.length };
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    const items = getStoredNotifications();
    const filtered = items.filter((n) => n.id !== id);
    saveStoredNotifications(filtered);
    return { success: true };
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return getStoredPreferences();
  },

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = getStoredPreferences();
    const updated: NotificationPreferences = {
      email: { ...current.email, ...(updates.email || {}) },
      inApp: { ...current.inApp, ...(updates.inApp || {}) },
      digestFrequency: updates.digestFrequency || current.digestFrequency,
    };
    saveStoredPreferences(updated);
    return updated;
  },

  async simulateIncomingEvent(event: Partial<NotificationItem>): Promise<NotificationItem> {
    const items = getStoredNotifications();
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: event.type || 'SYSTEM_NOTIFICATION',
      priority: event.priority || 'MEDIUM',
      title: event.title || 'System Notification',
      message: event.message || 'An event has been logged in DealFlow360.',
      isRead: false,
      createdAt: new Date().toISOString(),
      route: event.route || '/app/dashboard',
      entityType: event.entityType,
      entityId: event.entityId,
      actorName: event.actorName || 'DealFlow System',
      actorRole: event.actorRole || 'System',
    };

    const updated = [newItem, ...items];
    saveStoredNotifications(updated);
    return newItem;
  },
};

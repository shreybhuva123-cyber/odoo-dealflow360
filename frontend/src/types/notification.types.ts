export type NotificationType =
  | 'QUOTE_SUBMITTED'
  | 'QUOTE_APPROVED'
  | 'QUOTE_REJECTED'
  | 'QUOTE_RETURNED'
  | 'QUOTE_EXPIRING'
  | 'QUOTE_ACCEPTED'
  | 'NEGOTIATION_REQUESTED'
  | 'NEGOTIATION_UPDATED'
  | 'DEAL_RISK_INCREASED'
  | 'DEAL_STALLED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_COMPLETED'
  | 'FULFILLMENT_UPDATED'
  | 'SHIPMENT_UPDATED'
  | 'INVOICE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'SUBSCRIPTION_UPDATED'
  | 'SYSTEM_NOTIFICATION';

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type NotificationCategory =
  | 'ALL'
  | 'UNREAD'
  | 'APPROVALS'
  | 'RISK'
  | 'FINANCE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: 'quotation' | 'deal' | 'approval' | 'fulfillment' | 'invoice' | 'subscription' | 'customer' | 'system';
  entityId?: string;
  route?: string;
  actorName?: string;
  actorRole?: string;
}

export interface NotificationFilterOptions {
  search?: string;
  isRead?: boolean;
  type?: NotificationType | 'ALL';
  category?: NotificationCategory;
  priority?: NotificationPriority | 'ALL';
  dateRange?: string;
}

export interface NotificationPreferences {
  email: {
    approvalRequired: boolean;
    quoteApproved: boolean;
    quoteRejected: boolean;
    dealRiskIncreased: boolean;
    dealStalled: boolean;
    invoiceOverdue: boolean;
    paymentReceived: boolean;
    customerNegotiation: boolean;
  };
  inApp: {
    approvalRequired: boolean;
    quoteApproved: boolean;
    quoteRejected: boolean;
    dealRiskIncreased: boolean;
    dealStalled: boolean;
    invoiceOverdue: boolean;
    paymentReceived: boolean;
    customerNegotiation: boolean;
  };
  digestFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY';
}

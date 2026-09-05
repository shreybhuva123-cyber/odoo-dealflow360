export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityType: 'QUOTATION' | 'APPROVAL' | 'INVENTORY' | 'BILLING' | 'CUSTOMER';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  timestamp: string;
}

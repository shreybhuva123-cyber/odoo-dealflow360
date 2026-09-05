export type BillingInterval = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'MILESTONE';

export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'TRIGGERED' | 'INVOICED' | 'COMPLETED';
}

export interface BillingSchedule {
  id: string;
  quotationId?: string;
  quotationNumber?: string;
  dealId?: string;
  dealName?: string;
  customerId: string;
  customerName: string;
  billingType: 'ONE_OFF' | 'SUBSCRIPTION' | 'MILESTONE_BASED';
  currency: string;
  totalContractValue: number;
  interval?: BillingInterval;
  frequency?: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  amount: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  milestones?: Milestone[];
}

export interface Subscription {
  id: string;
  quotationId?: string;
  quotationNumber?: string;
  dealId?: string;
  dealName?: string;
  customerId: string;
  customerName: string;
  planName: string;
  planTier?: string;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  amount: number;
  currency: string;
  billingCycle: BillingInterval;
  frequency?: string;
  startDate: string;
  nextBillingDate?: string;
  renewalDate?: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  invoicesCount?: number;
  timeline?: {
    id: string;
    title: string;
    timestamp: string;
    status: 'completed' | 'current' | 'upcoming';
    note?: string;
  }[];
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxPct?: number;
  lineTotal: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'bank_transfer' | 'credit_card' | 'upi' | 'check' | 'wire';
  reference: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  recordedBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  quotationNumber?: string;
  dealId?: string;
  dealName?: string;
  fulfillmentId?: string;
  fulfillmentNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
  items: InvoiceItem[];
  payments: Payment[];
  billTo?: {
    name: string;
    company: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    taxId?: string;
  };
  remindersSentCount?: number;
  lastReminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingStats {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  paidAmount: number;
  dueSoonAmount: number;
  mrr: number;
  activeSubscriptionsCount: number;
  overdueCount: number;
  invoicesCount: number;
  avgPaymentDays: number;
}

export interface InvoiceFilterOptions {
  search?: string;
  status?: string;
  customerId?: string;
  dateRange?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface BillingFilterOptions {
  search?: string;
  frequency?: string;
  status?: string;
}

export interface SubscriptionFilterOptions {
  search?: string;
  status?: string;
  billingCycle?: string;
}

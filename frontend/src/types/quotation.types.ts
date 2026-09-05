export type QuotationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEGOTIATION'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'IN_REVIEW'
  | 'SENT'
  | 'NEGOTIATING'
  | 'ACCEPTED';

export interface QuotationLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountPct: number;
  lineTotal: number;
  grossMarginPct: number;
  warehouseId?: string;
  notes?: string;
}

export interface QuotationSummary {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  overallMarginPct: number;
  currency: string;
}

export interface NegotiationMessage {
  id: string;
  sender: 'CUSTOMER' | 'SALES_REP' | 'SYSTEM';
  senderName: string;
  content: string;
  proposedDiscount?: number;
  proposedTotal?: number;
  timestamp: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  customerTier?: 'GOLD' | 'SILVER' | 'BRONZE';
  status: QuotationStatus;
  lines: QuotationLine[];
  summary: QuotationSummary;
  riskScore: number; // 0 - 100
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  approvalRequired: boolean;
  approvalRequestId?: string;
  dealId?: string;
  dealName?: string;
  portalToken?: string;
  expiryDate: string;
  assignedRepId: string;
  assignedRepName: string;
  negotiationThread: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

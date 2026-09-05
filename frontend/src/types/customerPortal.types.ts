export type CustomerQuoteStatus =
  | 'awaiting_response'
  | 'viewed'
  | 'negotiation_requested'
  | 'changes_requested'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export interface CustomerQuoteItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  discountAmount?: number;
  total: number;
  category?: string;
  badge?: string;
}

export interface CustomerQuoteVersionChange {
  item: string;
  previous: string;
  updated: string;
}

export interface CustomerQuoteVersion {
  versionNumber: number;
  updatedAt: string;
  total: number;
  summary: string;
  changes: CustomerQuoteVersionChange[];
}

export interface CustomerQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail?: string;
  issueDate: string;
  validUntil: string;
  status: CustomerQuoteStatus;
  currency: string;
  items: CustomerQuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping?: number;
  total: number;
  version: number;
  previousVersion?: CustomerQuoteVersion;
  salesRepName?: string;
  salesRepEmail?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface NegotiationItemRequest {
  itemId: string;
  productName: string;
  currentQuantity: number;
  requestedQuantity: number;
  currentPrice: number;
  requestedPrice: number;
  note?: string;
}

export interface NegotiationRequest {
  id: string;
  quoteId: string;
  quoteNumber: string;
  token: string;
  customerName: string;
  customerEmail?: string;
  items: NegotiationItemRequest[];
  message: string;
  createdAt: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  salesRepResponse?: string;
}

export interface CustomerTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actorType: 'customer' | 'sales_team' | 'system';
}

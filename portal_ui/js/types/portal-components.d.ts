/**
 * DealFlow360 Customer Portal - Reusable Foundation Component Prop Types
 */

export type QuoteStatus = 'draft' | 'sent' | 'in_negotiation' | 'approved' | 'rejected' | 'expired';

export type NegotiationStatus =
  | 'pending_seller_review'
  | 'pending_buyer_review'
  | 'approved_by_seller'
  | 'declined_by_seller';

export interface CustomerUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  canSignQuotes: boolean;
  commercialPartnerName: string;
  partnerId: number;
}

export interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
}

export interface NegotiationStatusBadgeProps {
  status: NegotiationStatus;
  size?: 'sm' | 'md';
}

export interface PortalHeaderProps {
  tenantName: string;
  portalEnvironment?: 'production' | 'staging' | 'demo';
  unreadNotificationCount?: number;
  user: CustomerUserSummary;
  onNotificationClick?: () => void;
  onLogout?: () => void;
}

export interface CustomerIdentityProps {
  user: CustomerUserSummary;
  sessionExpiresInSeconds?: number;
  onLogout?: () => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
}

export interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
}

export interface MainContentAreaProps {
  title: string;
  subtitle?: string;
  statusBadgeHtml?: string;
  actionsHtml?: string;
  contentHtml: string;
}

export interface ModalDialogProps {
  id: string;
  isOpen?: boolean;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bodyHtml: string;
  footerHtml?: string;
  closeOnBackdropClick?: boolean;
  onClose?: () => void;
}

export interface SlideOverDrawerProps {
  id: string;
  isOpen?: boolean;
  title: string;
  subtitle?: string;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  bodyHtml: string;
  footerHtml?: string;
  onClose?: () => void;
}

export interface ConfirmationDialogProps {
  id: string;
  isOpen?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireCheckbox?: boolean;
  checkboxLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  errorCode?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export interface ErrorViewProps {
  title: string;
  errorCode?: string;
  message: string;
  details?: string;
  illustration?: '404' | '403' | 'expired' | 'server_error';
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export interface EmptyStateViewProps {
  title: string;
  description: string;
  iconType?: 'quotes' | 'comments' | 'notifications' | 'generic';
  actionLabel?: string;
}

export interface LineItemViewModel {
  line_id: string;
  product_id?: string;
  name: string;
  description?: string;
  charge_type: 'one_time' | 'recurring';
  recurring_interval?: 'monthly' | 'annual' | null;
  quantity: number;
  uom: string;
  unit_price: number;
  discount_percent: number;
  discount_amount?: number;
  subtotal: number;
  tax_rate_percent?: number;
  tax_amount: number;
  total_amount: number;
}

export interface PricingSummaryViewModel {
  subtotal: number;
  discount_total: number;
  discount_percentage?: number;
  tax_total: number;
  total_amount: number;
  one_time_total?: number;
  recurring_total?: number;
  recurring_interval?: 'monthly' | 'annual' | null;
}

export interface QuoteDetailViewModel {
  quote_id: string;
  quote_number: string;
  title: string;
  commercial_partner_id: number;
  partner_id: number;
  status: QuoteStatus;
  negotiation_status: NegotiationStatus | 'none';
  revision_number: number;
  created_at: string;
  updated_at?: string;
  expiration_date: string;
  currency: string;
  pricing_summary: PricingSummaryViewModel;
  sales_rep: {
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  customer: {
    company_name: string;
    contact_name: string;
    billing_address?: string;
    shipping_address?: string;
  };
  line_items: LineItemViewModel[];
  terms_and_conditions: string;
  payment_terms: string;
  can_accept: boolean;
  can_negotiate: boolean;
  reference_order_number?: string;
  confirmed_at?: string;
  unread_comments_count?: number;
}

export interface QuoteDetailHeaderProps {
  quote: QuoteDetailViewModel;
  user?: CustomerUserSummary;
}

export interface QuoteNegotiationBannerProps {
  quote: QuoteDetailViewModel;
  negotiation?: any;
}

export interface QuoteLineItemsTableProps {
  lines: LineItemViewModel[];
  currency?: string;
  canNegotiate?: boolean;
}

export interface QuotePricingSummaryProps {
  quote: QuoteDetailViewModel;
  user?: CustomerUserSummary;
}

export interface QuoteCommercialTermsProps {
  quote: QuoteDetailViewModel;
}

export interface QuoteSalesRepCardProps {
  quote: QuoteDetailViewModel;
}

export interface QuoteDetailContainerProps {
  isLoading?: boolean;
  error?: any;
  quote?: QuoteDetailViewModel | null;
  negotiation?: any;
  user?: CustomerUserSummary;
}


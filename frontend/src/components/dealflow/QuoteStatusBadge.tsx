import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuotationStatus } from '@/types';

const statusConfig: Record<
  QuotationStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'purple' }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  IN_REVIEW: { label: 'In Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  SENT: { label: 'Sent to Client', variant: 'info' },
  NEGOTIATION: { label: 'Negotiation', variant: 'purple' },
  NEGOTIATING: { label: 'Negotiating', variant: 'purple' },
  CONFIRMED: { label: 'Confirmed (Won)', variant: 'success' },
  ACCEPTED: { label: 'Accepted (Won)', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export function QuoteStatusBadge({ status }: { status: QuotationStatus }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };
  return (
    <Badge variant={config.variant} size="default">
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 inline-block opacity-80" />
      {config.label}
    </Badge>
  );
}

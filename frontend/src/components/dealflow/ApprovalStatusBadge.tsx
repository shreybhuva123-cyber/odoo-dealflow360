import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ApprovalStatus } from '@/types';

const approvalConfig: Record<
  ApprovalStatus,
  { label: string; variant: 'warning' | 'success' | 'destructive' | 'info' }
> = {
  PENDING: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  ESCALATED: { label: 'Escalated to VP', variant: 'info' },
  RETURNED: { label: 'Revision Requested', variant: 'warning' },
  PENDING_REVISION: { label: 'Pending Revision', variant: 'warning' },
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const config = approvalConfig[status] || { label: status, variant: 'warning' };
  return (
    <Badge variant={config.variant} size="default">
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 inline-block" />
      {config.label}
    </Badge>
  );
}

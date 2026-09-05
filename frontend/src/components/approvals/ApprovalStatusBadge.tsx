import React from 'react';
import { ApprovalStatus } from '@/types';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus | string;
  size?: 'sm' | 'md';
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const norm = (status || 'PENDING').toUpperCase();

  let badgeClass = 'badge-blue';
  let label = status;
  let icon = '⏳';

  switch (norm) {
    case 'PENDING':
      badgeClass = 'badge-amber';
      label = 'Pending Review';
      icon = '⏳';
      break;
    case 'APPROVED':
      badgeClass = 'badge-green';
      label = 'Approved';
      icon = '✓';
      break;
    case 'REJECTED':
      badgeClass = 'badge-red';
      label = 'Rejected';
      icon = '✕';
      break;
    case 'RETURNED':
    case 'PENDING_REVISION':
      badgeClass = 'badge-purple';
      label = 'Revision Requested';
      icon = '↩';
      break;
    case 'ESCALATED':
      badgeClass = 'badge-red';
      label = 'Escalated to VP';
      icon = '⚠';
      break;
    default:
      badgeClass = 'badge-gray';
      label = status;
      icon = '•';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      className={`badge ${badgeClass} inline-flex items-center gap-1.5 font-medium`}
      style={{ padding, fontSize, borderRadius: '6px' }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};

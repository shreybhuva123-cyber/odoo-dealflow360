import React from 'react';
import { QuotationStatus as StatusType } from '@/types';

interface QuotationStatusProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuotationStatus({ status, size = 'sm', className = '' }: QuotationStatusProps) {
  const norm = (status || 'DRAFT').toUpperCase().replace(' ', '_');

  let badgeClass = 'badge-gray';
  let dotIcon = '🟡';
  let label = 'Draft';

  switch (norm) {
    case 'DRAFT':
      badgeClass = 'badge-gray';
      dotIcon = '🟡';
      label = 'Draft';
      break;
    case 'PENDING_APPROVAL':
    case 'IN_REVIEW':
      badgeClass = 'badge-amber';
      dotIcon = '🔵';
      label = 'Pending Approval';
      break;
    case 'APPROVED':
      badgeClass = 'badge-green';
      dotIcon = '🟢';
      label = 'Approved';
      break;
    case 'REJECTED':
      badgeClass = 'badge-red';
      dotIcon = '🔴';
      label = 'Rejected';
      break;
    case 'NEGOTIATION':
    case 'NEGOTIATING':
      badgeClass = 'badge-purple';
      dotIcon = '🟣';
      label = 'Negotiation';
      break;
    case 'CONFIRMED':
    case 'ACCEPTED':
      badgeClass = 'badge-green';
      dotIcon = '🟢';
      label = 'Confirmed';
      break;
    case 'EXPIRED':
      badgeClass = 'badge-gray';
      dotIcon = '⚪';
      label = 'Expired';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-red';
      dotIcon = '⚪';
      label = 'Cancelled';
      break;
    default:
      badgeClass = 'badge-blue';
      dotIcon = 'ℹ️';
      label = status;
  }

  return (
    <span
      className={`badge ${badgeClass} ${size === 'md' ? 'text-xs px-2.5 py-1' : ''} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
    >
      <span style={{ fontSize: size === 'md' ? '11px' : '9px', lineHeight: 1 }}>{dotIcon}</span>
      <span>{label}</span>
    </span>
  );
}

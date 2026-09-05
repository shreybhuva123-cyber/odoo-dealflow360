import React from 'react';
import { InvoiceStatus } from '@/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InvoiceStatusBadge({
  status,
  size = 'md',
  className = '',
}: InvoiceStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          icon: '📝',
          bg: 'var(--surface2)',
          color: 'var(--text-muted)',
          border: 'var(--border)',
        };
      case 'pending':
        return {
          label: 'Payment Pending',
          icon: '⏳',
          bg: 'var(--amber-dim)',
          color: 'var(--amber)',
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'partially_paid':
        return {
          label: 'Partially Paid',
          icon: '◐',
          bg: 'rgba(234, 88, 12, 0.15)',
          color: '#FB923C',
          border: 'rgba(234, 88, 12, 0.3)',
        };
      case 'paid':
        return {
          label: 'Paid',
          icon: '✓',
          bg: 'var(--green-dim)',
          color: 'var(--green)',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          icon: '⚠',
          bg: 'var(--red-dim)',
          color: 'var(--red)',
          border: 'rgba(239, 68, 68, 0.4)',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: '✕',
          bg: 'var(--surface2)',
          color: 'var(--text-dim)',
          border: 'var(--border)',
        };
      default:
        return {
          label: status,
          icon: '•',
          bg: 'var(--surface2)',
          color: 'var(--text-muted)',
          border: 'var(--border)',
        };
    }
  };

  const config = getStatusConfig();
  const padding = size === 'sm' ? '2px 7px' : size === 'lg' ? '6px 14px' : '4px 10px';
  const fontSize = size === 'sm' ? '10px' : size === 'lg' ? '13px' : '11px';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full select-none ${className}`}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding,
        fontSize,
        letterSpacing: '0.2px',
        lineHeight: 1.2,
      }}
    >
      <span style={{ fontSize: '1.1em' }}>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

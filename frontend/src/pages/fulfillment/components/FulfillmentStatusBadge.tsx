import React from 'react';
import { FulfillmentStatus, FulfillmentPriority } from '@/types';

interface FulfillmentStatusBadgeProps {
  status: FulfillmentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FulfillmentStatusBadge({
  status,
  size = 'md',
  className = '',
}: FulfillmentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: '⏳',
          bg: 'var(--amber-dim)',
          color: 'var(--amber)',
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'allocated':
        return {
          label: 'Allocated',
          icon: '📦',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: 'var(--accent)',
          border: 'rgba(59, 130, 246, 0.3)',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: '⚙️',
          bg: 'rgba(168, 85, 247, 0.15)',
          color: '#C084FC',
          border: 'rgba(168, 85, 247, 0.3)',
        };
      case 'ready':
        return {
          label: 'Ready to Ship',
          icon: '📦',
          bg: 'rgba(99, 102, 241, 0.15)',
          color: '#818CF8',
          border: 'rgba(99, 102, 241, 0.3)',
        };
      case 'shipped':
        return {
          label: 'Shipped',
          icon: '🚚',
          bg: 'rgba(6, 182, 212, 0.15)',
          color: 'var(--cyan, #06b6d4)',
          border: 'rgba(6, 182, 212, 0.3)',
        };
      case 'partially_delivered':
        return {
          label: 'Partial Delivery',
          icon: '🚛',
          bg: 'rgba(234, 88, 12, 0.15)',
          color: '#FB923C',
          border: 'rgba(234, 88, 12, 0.3)',
        };
      case 'delivered':
      case 'completed':
        return {
          label: status === 'delivered' ? 'Delivered' : 'Completed',
          icon: '✓',
          bg: 'var(--green-dim)',
          color: 'var(--green)',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: '✕',
          bg: 'var(--red-dim)',
          color: 'var(--red)',
          border: 'rgba(239, 68, 68, 0.3)',
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

export function FulfillmentPriorityBadge({
  priority,
  size = 'md',
}: {
  priority: FulfillmentPriority;
  size?: 'sm' | 'md';
}) {
  const getPriorityStyle = () => {
    switch (priority) {
      case 'critical':
        return { label: 'CRITICAL', color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(239, 68, 68, 0.4)' };
      case 'high':
        return { label: 'HIGH', color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'rgba(245, 158, 11, 0.4)' };
      case 'normal':
        return { label: 'NORMAL', color: 'var(--text-muted)', bg: 'var(--surface2)', border: 'var(--border)' };
      case 'low':
        return { label: 'LOW', color: 'var(--text-dim)', bg: 'var(--surface2)', border: 'transparent' };
    }
  };

  const s = getPriorityStyle();
  const pad = size === 'sm' ? '1px 6px' : '2px 8px';
  const font = size === 'sm' ? '9px' : '10px';

  return (
    <span
      className="inline-flex items-center rounded font-mono font-bold uppercase tracking-wider"
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: pad,
        fontSize: font,
      }}
    >
      {s.label}
    </span>
  );
}

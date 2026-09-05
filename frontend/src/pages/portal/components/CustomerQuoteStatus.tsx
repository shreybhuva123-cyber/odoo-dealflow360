import React from 'react';
import { CustomerQuoteStatus as StatusType } from '@/types';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileEdit, Eye, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerQuoteStatusProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  awaiting_response: {
    label: 'Awaiting Your Review',
    icon: Clock,
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-700/50',
  },
  viewed: {
    label: 'Under Review',
    icon: Eye,
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-700/50',
  },
  negotiation_requested: {
    label: 'Negotiation In Progress',
    icon: FileEdit,
    bg: 'bg-purple-950/40',
    text: 'text-purple-400',
    border: 'border-purple-700/50',
  },
  changes_requested: {
    label: 'Changes Requested',
    icon: FileEdit,
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    border: 'border-indigo-700/50',
  },
  accepted: {
    label: 'Quotation Accepted',
    icon: CheckCircle2,
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-700/50',
  },
  rejected: {
    label: 'Quotation Declined',
    icon: XCircle,
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-700/50',
  },
  expired: {
    label: 'Offer Expired',
    icon: AlertCircle,
    bg: 'bg-slate-900',
    text: 'text-slate-400',
    border: 'border-slate-700',
  },
  cancelled: {
    label: 'Quotation Cancelled',
    icon: Ban,
    bg: 'bg-slate-900',
    text: 'text-slate-500',
    border: 'border-slate-800',
  },
};

export function CustomerQuoteStatus({ status, className, size = 'md' }: CustomerQuoteStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.awaiting_response;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}

import React from 'react';
import { DealHealthStatus } from '@/types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealHealthBadgeProps {
  status: DealHealthStatus | 'healthy' | 'at_risk' | 'critical';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DealHealthBadge({ status, className, size = 'md' }: DealHealthBadgeProps) {
  const normStatus = status.toUpperCase() as DealHealthStatus;

  const config = {
    HEALTHY: {
      label: 'Healthy',
      icon: CheckCircle2,
      bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50',
    },
    AT_RISK: {
      label: 'At Risk',
      icon: AlertTriangle,
      bg: 'bg-amber-950/40 text-amber-400 border-amber-700/50',
    },
    CRITICAL: {
      label: 'Critical',
      icon: AlertOctagon,
      bg: 'bg-rose-950/40 text-rose-400 border-rose-700/50',
    },
  }[normStatus] || {
    label: normStatus,
    icon: AlertTriangle,
    bg: 'bg-slate-900 text-slate-400 border-slate-700',
  };

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
        sizeClasses[size],
        className
      )}
    >
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}

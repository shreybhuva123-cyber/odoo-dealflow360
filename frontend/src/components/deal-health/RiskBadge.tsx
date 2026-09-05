import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel | 'LOW' | 'MEDIUM' | 'HIGH';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, className, size = 'md' }: RiskBadgeProps) {
  const normLevel = level.toUpperCase() as RiskLevel;

  const config = {
    LOW: {
      label: 'Low Risk',
      icon: ShieldCheck,
      bg: 'bg-blue-950/40 text-blue-400 border-blue-700/50',
    },
    MEDIUM: {
      label: 'Medium Risk',
      icon: AlertTriangle,
      bg: 'bg-amber-950/40 text-amber-400 border-amber-700/50',
    },
    HIGH: {
      label: 'High Risk',
      icon: ShieldAlert,
      bg: 'bg-rose-950/40 text-rose-400 border-rose-700/50',
    },
  }[normLevel] || {
    label: normLevel,
    icon: ShieldAlert,
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

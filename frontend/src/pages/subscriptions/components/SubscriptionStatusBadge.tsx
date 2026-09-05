import React from 'react';
import { SubscriptionStatus } from '@/types';
import { CheckCircle2, PauseCircle, AlertTriangle, XCircle, Clock, Sparkles } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function SubscriptionStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: SubscriptionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          icon: CheckCircle2,
          bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dotColor: 'bg-emerald-400 animate-pulse',
        };
      case 'trial':
        return {
          label: 'Trial',
          icon: Sparkles,
          bgColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dotColor: 'bg-cyan-400',
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: PauseCircle,
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dotColor: 'bg-amber-400',
        };
      case 'past_due':
        return {
          label: 'Past Due',
          icon: AlertTriangle,
          bgColor: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dotColor: 'bg-rose-400 animate-pulse',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dotColor: 'bg-slate-400',
        };
      case 'expired':
        return {
          label: 'Expired',
          icon: Clock,
          bgColor: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
          dotColor: 'bg-zinc-400',
        };
      default:
        return {
          label: status,
          icon: Clock,
          bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          dotColor: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bgColor} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

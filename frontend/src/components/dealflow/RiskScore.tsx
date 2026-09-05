import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface RiskScoreProps {
  score: number; // 0 - 100
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function RiskScore({ score, showLabel = true, size = 'default', className }: RiskScoreProps) {
  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let Icon = ShieldCheck;

  if (score >= 70) {
    level = 'HIGH';
    color = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    Icon = ShieldAlert;
  } else if (score >= 40) {
    level = 'MEDIUM';
    color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium',
        color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">{score}/100</span>
      {showLabel && (
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
          ({level} RISK)
        </span>
      )}
    </div>
  );
}

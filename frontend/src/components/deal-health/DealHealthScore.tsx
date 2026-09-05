import React from 'react';
import { DealHealthStatus } from '@/types';
import { cn } from '@/lib/utils';
import { DealHealthBadge } from './DealHealthBadge';

interface DealHealthScoreProps {
  score: number; // 0 - 100
  status: DealHealthStatus | 'healthy' | 'at_risk' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export function DealHealthScore({
  score,
  status,
  size = 'md',
  showBadge = true,
  className,
}: DealHealthScoreProps) {
  const normStatus = status.toUpperCase() as DealHealthStatus;

  // Visual parameters based on size
  const dim = {
    sm: { r: 24, stroke: 4, width: 64, height: 64, text: 'text-base font-bold', sub: 'text-[9px]' },
    md: { r: 36, stroke: 6, width: 96, height: 96, text: 'text-2xl font-bold', sub: 'text-[10px]' },
    lg: { r: 52, stroke: 8, width: 136, height: 136, text: 'text-3xl font-extrabold', sub: 'text-xs' },
  }[size];

  const circumference = 2 * Math.PI * dim.r;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const colorConfig = {
    HEALTHY: {
      stroke: '#10b981', // emerald-500
      glow: 'shadow-emerald-500/20',
      text: 'text-emerald-400',
    },
    AT_RISK: {
      stroke: '#f59e0b', // amber-500
      glow: 'shadow-amber-500/20',
      text: 'text-amber-400',
    },
    CRITICAL: {
      stroke: '#ef4444', // rose-500
      glow: 'shadow-rose-500/20',
      text: 'text-rose-400',
    },
  }[normStatus] || {
    stroke: '#64748b',
    glow: '',
    text: 'text-slate-400',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn('relative flex items-center justify-center', colorConfig.glow)}>
        <svg
          width={dim.width}
          height={dim.height}
          viewBox={`0 0 ${dim.width} ${dim.height}`}
          className="rotate-[-90deg]"
        >
          {/* Background Track */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={dim.r}
            fill="none"
            stroke="#1e293b" // slate-800
            strokeWidth={dim.stroke}
          />
          {/* Progress Arc */}
          <circle
            cx={dim.width / 2}
            cy={dim.height / 2}
            r={dim.r}
            fill="none"
            stroke={colorConfig.stroke}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className={cn('font-mono leading-none tracking-tight', dim.text, colorConfig.text)}>
            {clampedScore}
          </span>
          <span className={cn('uppercase font-semibold tracking-wider text-slate-500', dim.sub)}>
            / 100
          </span>
        </div>
      </div>

      {showBadge && <DealHealthBadge status={normStatus} size={size === 'lg' ? 'md' : 'sm'} />}
    </div>
  );
}

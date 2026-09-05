import React from 'react';
import { cn } from '@/lib/utils';
import { Tag, AlertCircle } from 'lucide-react';
import { formatPercent } from '@/utils/formatters';

export interface DiscountIndicatorProps {
  discountPct: number;
  maxAllowablePct?: number; // e.g. 15%
  className?: string;
}

export function DiscountIndicator({
  discountPct,
  maxAllowablePct = 15,
  className,
}: DiscountIndicatorProps) {
  const exceedsAllowable = discountPct > maxAllowablePct;

  return (
    <div className={cn('inline-flex items-center gap-1.5 font-mono text-xs', className)}>
      {exceedsAllowable ? (
        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
      ) : (
        <Tag className="h-3.5 w-3.5 text-blue-400" />
      )}
      <span
        className={cn(
          'font-semibold',
          exceedsAllowable ? 'text-rose-400 underline decoration-rose-500/50' : 'text-foreground'
        )}
      >
        {formatPercent(discountPct)}
      </span>
      {exceedsAllowable && (
        <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded">
          Approval Needed
        </span>
      )}
    </div>
  );
}

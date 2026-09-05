import React from 'react';
import { RiskSignal as RiskSignalType } from '@/types';
import { AlertTriangle, AlertOctagon, Info, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskSignalProps {
  signal: RiskSignalType;
  className?: string;
}

export function RiskSignal({ signal, className }: RiskSignalProps) {
  const isHigh = signal.severity === 'HIGH';
  const isMedium = signal.severity === 'MEDIUM';

  const Icon = isHigh ? AlertOctagon : isMedium ? AlertTriangle : Info;

  const severityStyles = isHigh
    ? 'border-rose-800/40 bg-rose-950/20 text-rose-300'
    : isMedium
    ? 'border-amber-800/40 bg-amber-950/20 text-amber-300'
    : 'border-blue-800/40 bg-blue-950/20 text-blue-300';

  const iconColor = isHigh
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : isMedium
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-blue-400 bg-blue-500/10 border-blue-500/30';

  const categoryLabels: Record<string, string> = {
    DISCOUNT: 'Discount Policy',
    MARGIN: 'Margin Guard',
    STALLED: 'Activity Velocity',
    APPROVAL: 'Approval SLA',
    PROBABILITY: 'Win Probability',
    CUSTOMER_CREDIT: 'Credit Exposure',
    CUSTOMER_NEGOTIATION: 'Customer Terms',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 backdrop-blur transition-colors space-y-2',
        severityStyles,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{signal.title}</h4>
              <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 border border-slate-700">
                {categoryLabels[signal.type] || signal.type}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{signal.description}</p>
          </div>
        </div>

        {signal.metricChange && (
          <div className="shrink-0 text-right font-mono text-xs">
            <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 font-bold border border-slate-700 text-white">
              {signal.metricChange.from}
              {signal.metricChange.unit || '%'} &rarr; {signal.metricChange.to}
              {signal.metricChange.unit || '%'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Detected: {new Date(signal.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="capitalize">
          Status: <strong className="text-slate-300">{signal.status}</strong>
        </span>
      </div>
    </div>
  );
}

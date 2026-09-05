import React from 'react';
import { RiskSignal as RiskSignalType, RiskLevel } from '@/types';
import { RiskBadge } from './RiskBadge';
import { RiskSignal } from './RiskSignal';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RiskBreakdownProps {
  riskLevel: RiskLevel;
  signals: RiskSignalType[];
  className?: string;
}

export function RiskBreakdown({ riskLevel, signals, className }: RiskBreakdownProps) {
  const activeSignals = signals.filter((s) => s.status === 'active');
  const resolvedSignals = signals.filter((s) => s.status !== 'active');

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h3 className="text-base font-semibold text-white">Deal Risk & Anomaly Breakdown</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Overall Assessment:</span>
          <RiskBadge level={riskLevel} size="md" />
        </div>
      </div>

      {/* Active Signals */}
      {activeSignals.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Risk Signals ({activeSignals.length})
          </div>
          <div className="space-y-2.5">
            {activeSignals.map((sig) => (
              <RiskSignal key={sig.id} signal={sig} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/30 p-4 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>No active risk anomalies detected for this deal. Compliance guardrails are satisfied.</span>
        </div>
      )}

      {/* Resolved / Mitigated Signals */}
      {resolvedSignals.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resolved / Mitigated ({resolvedSignals.length})
          </div>
          <div className="space-y-2 opacity-75">
            {resolvedSignals.map((sig) => (
              <RiskSignal key={sig.id} signal={sig} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { RiskSignal as RiskSignalType } from '@/types';
import { RiskSignal } from '@/components/deal-health';
import { Activity, AlertCircle } from 'lucide-react';

interface DealHealthSignalsProps {
  signals: RiskSignalType[];
}

export function DealHealthSignals({ signals }: DealHealthSignalsProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Deal Health & Telemetry Signals</h3>
        </div>
        <span className="text-xs text-slate-400">
          {signals.length} active sensor{signals.length !== 1 ? 's' : ''} monitored
        </span>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-lg bg-slate-950/40 border border-slate-800 p-6 text-center text-xs text-slate-400">
          <AlertCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
          <p className="font-semibold text-white">All Health Telemetry Normal</p>
          <p className="text-slate-500 mt-0.5">No negative anomaly or velocity alerts triggered.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((sig) => (
            <RiskSignal key={sig.id} signal={sig} />
          ))}
        </div>
      )}
    </div>
  );
}

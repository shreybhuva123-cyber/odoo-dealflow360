import React from 'react';
import { DealHealthTimelineEvent } from '@/types';
import { Clock, AlertTriangle, ShieldAlert, GitCommit, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealHealthTimelineProps {
  timeline: DealHealthTimelineEvent[];
}

export function DealHealthTimeline({ timeline }: DealHealthTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const getEventIcon = (type: DealHealthTimelineEvent['type'], severity?: string) => {
    if (severity === 'HIGH') return { icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (severity === 'MEDIUM') return { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

    switch (type) {
      case 'STAGE_CHANGE':
        return { icon: GitCommit, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'DISCOUNT_APPLIED':
        return { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'APPROVAL_UPDATE':
        return { icon: CheckCircle2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'CUSTOMER_ACTION':
        return { icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { icon: Clock, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Clock className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Deal Health & Risk Evolution Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-800">
        {timeline.map((event) => {
          const config = getEventIcon(event.type, event.severity);
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={cn(
                  'absolute -left-[29px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border',
                  config.color
                )}
              >
                <Icon className="h-3 w-3" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-xs text-white">{event.title}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{event.timestamp}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 max-w-2xl">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

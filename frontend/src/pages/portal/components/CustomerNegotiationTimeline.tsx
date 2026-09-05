import React from 'react';
import { CustomerTimelineEvent } from '@/types';
import { Clock, User, ShieldCheck, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerNegotiationTimelineProps {
  events: CustomerTimelineEvent[];
}

export function CustomerNegotiationTimeline({ events }: CustomerNegotiationTimelineProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const getActorBadge = (actorType: CustomerTimelineEvent['actorType']) => {
    switch (actorType) {
      case 'customer':
        return {
          label: 'Customer Action',
          bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
          icon: User,
        };
      case 'sales_team':
        return {
          label: 'Sales Executive',
          bg: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
          icon: MessageSquare,
        };
      case 'system':
      default:
        return {
          label: 'System Notice',
          bg: 'bg-slate-900 text-slate-400 border-slate-800',
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Commercial Activity & Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-800">
        {events.map((evt) => {
          const badge = getActorBadge(evt.actorType);
          const Icon = badge.icon;

          return (
            <div key={evt.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[29px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-xs text-white">{evt.title}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border',
                      badge.bg
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{evt.timestamp}</span>
                </div>

                {evt.description && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl bg-slate-950/40 p-2.5 rounded-md border border-slate-800/60 mt-1">
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

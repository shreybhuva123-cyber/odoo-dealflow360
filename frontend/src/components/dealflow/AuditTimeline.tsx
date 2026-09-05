import React from 'react';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { Clock } from 'lucide-react';

export function AuditTimeline({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) {
    return <p className="text-xs text-muted-foreground italic">No audit trail entries recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-xs border-b border-border/30 pb-3 last:border-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground mt-0.5">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{log.action}</span>
              <span className="text-[10px] text-muted-foreground">{formatDateTime(log.timestamp)}</span>
            </div>
            <p className="text-muted-foreground">
              By <span className="text-foreground font-medium">{log.actorName}</span> on {log.entityType}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

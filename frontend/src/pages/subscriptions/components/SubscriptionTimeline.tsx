import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  timestamp: string;
  status: 'completed' | 'current' | 'upcoming';
  note?: string;
}

interface SubscriptionTimelineProps {
  timeline?: TimelineItem[];
}

export function SubscriptionTimeline({ timeline = [] }: SubscriptionTimelineProps) {
  if (!timeline.length) {
    return (
      <Card className="bg-card/70 border-border/70 p-5">
        <p className="text-xs text-muted-foreground">No lifecycle events recorded for this subscription.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card/70 border-border/70">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Subscription Lifecycle & Renewal Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {timeline.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'current';

            return (
              <div key={item.id || idx} className="relative group">
                {/* Node icon / indicator */}
                <div
                  className={`absolute -left-[29px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : isCurrent
                      ? 'bg-primary/20 border-primary text-primary animate-pulse'
                      : 'bg-surface-3 border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </div>

                  {item.note && (
                    <p className="text-xs text-muted-foreground bg-surface-2/40 p-2 rounded-md border border-border/40">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

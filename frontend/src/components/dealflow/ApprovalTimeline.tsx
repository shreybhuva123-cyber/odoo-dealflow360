import React from 'react';
import { ApprovalRequest } from '@/types';
import { CheckCircle2, Clock, XCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ApprovalTimeline({ request }: { request: ApprovalRequest }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b border-border/40">
        <Shield className="h-4 w-4 text-primary" />
        <span>Multi-Tier Signoff Pipeline</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
        {request.steps.map((step, idx) => {
          const isDone = step.status === 'APPROVED';
          const isRejected = step.status === 'REJECTED';
          const isPending = step.status === 'PENDING';

          return (
            <div key={idx} className="relative group">
              {/* Circle Icon */}
              <div
                className={cn(
                  'absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border',
                  isDone && 'border-emerald-500 text-emerald-400',
                  isRejected && 'border-rose-500 text-rose-400',
                  isPending && 'border-amber-500 text-amber-400'
                )}
              >
                {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                {isRejected && <XCircle className="h-3.5 w-3.5" />}
                {isPending && <Clock className="h-3.5 w-3.5" />}
              </div>

              <div className="bg-card p-3 rounded-lg border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Step {step.stepNumber}: {step.roleRequired}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                      isDone && 'bg-emerald-500/10 text-emerald-400',
                      isRejected && 'bg-rose-500/10 text-rose-400',
                      isPending && 'bg-amber-500/10 text-amber-400'
                    )}
                  >
                    {step.status}
                  </span>
                </div>
                {step.approverName && (
                  <p className="text-xs text-muted-foreground">Assignee: {step.approverName}</p>
                )}
                {step.comment && (
                  <p className="text-xs italic text-foreground/80 bg-secondary/40 p-2 rounded mt-1">
                    "{step.comment}"
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

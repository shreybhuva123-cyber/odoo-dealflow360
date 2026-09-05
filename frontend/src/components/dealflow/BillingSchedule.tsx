import React from 'react';
import { BillingSchedule as BillingScheduleType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';

export function BillingSchedule({ schedule }: { schedule: BillingScheduleType }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Contract Billing Schedule</h4>
          <p className="text-xs text-muted-foreground">Type: {schedule.billingType}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Total Contract Value</span>
          <span className="text-base font-bold text-primary font-mono">
            {formatCurrency(schedule.totalContractValue, schedule.currency)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {schedule.milestones?.map((milestone, idx) => (
          <div
            key={milestone.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/30 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px]">
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-foreground">{milestone.name}</p>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" /> Due: {milestone.dueDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-bold text-foreground font-mono block">
                  {formatCurrency(milestone.amount, schedule.currency)}
                </span>
                <span className="text-[10px] text-muted-foreground">{milestone.percentage}% of total</span>
              </div>
              <Badge variant={milestone.status === 'TRIGGERED' ? 'info' : 'secondary'} size="sm">
                {milestone.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

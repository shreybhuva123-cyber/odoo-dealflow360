import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RiskScore } from '@/components/dealflow/RiskScore';
import { Activity, Zap, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface DealHealthCardProps {
  score: number;
  customerName: string;
  quoteNumber: string;
  marginPct: number;
  daysInPipeline: number;
  insights?: string[];
}

export function DealHealthCard({
  score,
  customerName,
  quoteNumber,
  marginPct,
  daysInPipeline,
  insights = [
    'Margin above company baseline threshold (35%).',
    'Customer credit profile verified with low default risk.',
    'Stock fully reserved in primary warehouse.',
  ],
}: DealHealthCardProps) {
  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase">{quoteNumber}</span>
          <CardTitle className="text-sm font-semibold">{customerName}</CardTitle>
        </div>
        <RiskScore score={score} size="sm" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Deal Health Index</span>
            <span className="font-semibold text-foreground">{100 - score}% Healthy</span>
          </div>
          <Progress value={100 - score} indicatorColor={score > 60 ? 'bg-rose-500' : score > 35 ? 'bg-amber-500' : 'bg-emerald-500'} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-md bg-secondary/40 border border-border/40">
          <div>
            <span className="text-muted-foreground block text-[11px]">Gross Margin</span>
            <span className="font-semibold text-emerald-400 font-mono">{marginPct}%</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Pipeline Age</span>
            <span className="font-semibold text-foreground">{daysInPipeline} Days</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> AI Diagnostic Insights
          </span>
          <ul className="space-y-1">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

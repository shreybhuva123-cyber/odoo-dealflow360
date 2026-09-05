import React from 'react';
import { DealHealthDistributionItem } from '@/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { HeartPulse } from 'lucide-react';

interface HealthDistributionChartProps {
  distribution: DealHealthDistributionItem[];
  avgScore: number;
}

export function HealthDistributionChart({ distribution, avgScore }: HealthDistributionChartProps) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Deal Health Distribution</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">{total} deals tracked</span>
      </div>

      <div className="relative h-56 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DealHealthDistributionItem;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-xl text-xs">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        {data.label}
                      </div>
                      <div className="text-slate-400 mt-1">
                        Count: <strong className="text-white">{data.count}</strong> ({data.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
              stroke="none"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-2xl font-bold font-mono text-white leading-none">
            {avgScore}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Avg Health
          </span>
        </div>
      </div>

      {/* Legend strip */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs">
        {distribution.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 truncate">{item.label}</div>
              <div className="font-semibold text-white font-mono">{item.count} ({item.percentage}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

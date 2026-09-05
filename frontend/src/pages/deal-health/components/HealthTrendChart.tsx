import React, { useState } from 'react';
import { DealHealthTrendPoint } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface HealthTrendChartProps {
  trends: DealHealthTrendPoint[];
}

export function HealthTrendChart({ trends }: HealthTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '6mo' | '1yr'>('30d');

  const ranges: { label: string; value: '7d' | '30d' | '90d' | '6mo' | '1yr' }[] = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1yr' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Deal Health Trends Over Time</h3>
        </div>

        {/* Time range selector pills */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setTimeRange(r.value)}
              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                timeRange === r.value
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white">{label}</div>
                      {payload.map((entry: any) => (
                        <div key={entry.dataKey} className="flex justify-between gap-4 text-slate-300">
                          <span className="capitalize">{entry.name}:</span>
                          <strong className="font-mono text-white">{entry.value} deals</strong>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="healthy"
              name="Healthy"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHealthy)"
            />
            <Area
              type="monotone"
              dataKey="atRisk"
              name="At Risk"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAtRisk)"
            />
            <Area
              type="monotone"
              dataKey="critical"
              name="Critical"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCritical)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Healthy Deals</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>At Risk</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}

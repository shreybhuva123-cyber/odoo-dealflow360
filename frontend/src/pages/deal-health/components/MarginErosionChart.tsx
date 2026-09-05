import React from 'react';
import { MarginErosionDeal } from '@/types';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingDown, ArrowDownRight, ExternalLink } from 'lucide-react';
import { RiskBadge } from '@/components/deal-health';

interface MarginErosionChartProps {
  data: MarginErosionDeal[];
}

export function MarginErosionChart({ data }: MarginErosionChartProps) {
  const chartData = data.slice(0, 5).map((d) => ({
    name: d.customerName.split(' ')[0], // short label
    fullName: d.dealName,
    dealId: d.dealId,
    original: d.originalMargin,
    current: d.currentMargin,
    drop: Math.abs(d.marginDelta),
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Gross Margin Erosion Tracker</h3>
        </div>
        <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <ArrowDownRight className="h-3.5 w-3.5" />
          {data.length} deals experiencing margin compression
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 35]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white">{item.fullName}</div>
                      <div className="text-slate-400">
                        Original Floor: <strong className="text-white">{item.original}%</strong>
                      </div>
                      <div className="text-slate-400">
                        Current Projected: <strong className="text-rose-400">{item.current}%</strong>
                      </div>
                      <div className="text-rose-400 font-bold">
                        Net Slippage: -{item.drop.toFixed(1)}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-slate-400">{value}</span>}
            />
            <Bar dataKey="original" name="Target Margin %" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name="Realized Margin %" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top eroded deals table */}
      <div className="divide-y divide-slate-800/60 pt-2 border-t border-slate-800/80">
        {data.slice(0, 3).map((d) => (
          <div key={d.dealId} className="py-2.5 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <Link
                to={`/app/deal-health/${d.dealId}`}
                className="font-semibold text-white hover:text-blue-400 transition-colors truncate block flex items-center gap-1"
              >
                <span>{d.dealName}</span>
                <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
              </Link>
              <span className="text-[11px] text-slate-400">{d.customerName}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-right">
              <div className="font-mono text-xs">
                <span className="text-slate-500 line-through mr-1">{d.originalMargin}%</span>
                <span className="text-rose-400 font-bold">{d.currentMargin}%</span>
                <span className="block text-[10px] text-rose-400 font-bold">
                  ({d.marginDelta > 0 ? `+${d.marginDelta}` : d.marginDelta}%)
                </span>
              </div>
              <RiskBadge level={d.riskLevel} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

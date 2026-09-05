import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const REVENUE_DATA = [
  { month: 'Apr', billed: 18.5, collected: 16.0 },
  { month: 'May', billed: 22.0, collected: 20.5 },
  { month: 'Jun', billed: 28.4, collected: 24.0 },
  { month: 'Jul', billed: 34.0, collected: 29.5 },
  { month: 'Aug', billed: 39.2, collected: 33.8 },
  { month: 'Sep', billed: 42.5, collected: 31.9 },
];

export function BillingChart({ className = '' }: { className?: string }) {
  return (
    <div
      className={`card p-4 space-y-3 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Revenue Realization & Cash Collection (FY26)
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Monthly cumulative billed contract volume vs cleared customer cash receipts (₹ in Lakhs)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground text-[11px]">Billed Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground text-[11px]">Cash Settled</span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'var(--text)',
              }}
              formatter={(value: any) => [`₹${value} Lakhs`, '']}
            />
            <Area
              type="monotone"
              dataKey="billed"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBilled)"
            />
            <Area
              type="monotone"
              dataKey="collected"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCollected)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

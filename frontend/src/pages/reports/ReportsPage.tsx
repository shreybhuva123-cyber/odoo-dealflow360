import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { usePipelineReport } from '@/hooks/useReports';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Clock,
  Layers,
  Receipt,
  Truck,
  ArrowRight,
} from 'lucide-react';

export function ReportsPage() {
  const { data: reportData, isLoading } = usePipelineReport();

  const data = reportData || {
    totalPipelineValue: 0,
    weightedValue: 0,
    dealCount: 0,
    winRatePct: 0,
    avgDealCycleDays: 0,
    stageDistribution: [],
    marginTrend: [],
  };

  const reportModules = [
    {
      title: 'Pipeline Health & Velocity',
      description: 'Stage conversion ratios, win rates, and expected closing timelines.',
      icon: Layers,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      link: '/app/pipeline',
      stat: `${data.winRatePct}% Win Rate`,
    },
    {
      title: 'Deal Health & Anomaly Surveillance',
      description: 'Proactive detection of margin erosion, discount violations, and stalled deals.',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      link: '/app/deal-health',
      stat: `${data.dealCount} Total Deals`,
    },
    {
      title: 'Revenue & Cash Realization',
      description: 'Billing milestone achievements, collected cash, and invoice dunning recovery.',
      icon: Receipt,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      link: '/app/billing',
      stat: formatCurrency(data.weightedValue),
    },
    {
      title: 'Approval Turnaround SLA',
      description: 'Manager and finance queue duration, bottlenecks, and sign-off velocity.',
      icon: Clock,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      link: '/app/approvals',
      stat: `${data.avgDealCycleDays}d Avg Cycle`,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Executive Analytics & Reports Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Holistic cross-module intelligence spanning pipeline progression, risk surveillance, and revenue execution
          </p>
        </div>
      </div>

      {/* 4 Quick Analytics Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.title}
              to={mod.link}
              className="group rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 hover:bg-slate-800/50 transition-all backdrop-blur flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${mod.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{mod.stat}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                <span>Open Intelligence Module</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <span className="text-xs text-slate-400 block">Total Pipeline Tracked</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {formatCurrency(data.totalPipelineValue)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <span className="text-xs text-slate-400 block">Weighted Probability Value</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {formatCurrency(data.weightedValue)}
          </span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <span className="text-xs text-slate-400 block">Commercial Win Rate</span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
            {data.winRatePct}%
          </span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <span className="text-xs text-slate-400 block">Average Deal Cycle</span>
          <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
            {data.avgDealCycleDays} Days
          </span>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Value Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              Pipeline Value by Lifecycle Stage
            </h3>
            <span className="text-xs text-slate-400 font-mono">Gross Volume</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Value']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin Trend Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Monthly Gross Margin Realized vs Floor
            </h3>
            <span className="text-xs text-emerald-400 font-mono">Target: 35.0%</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.marginTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[20, 60]} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line
                  type="monotone"
                  dataKey="actualMargin"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="Realized Margin %"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetMargin"
                  stroke="#64748b"
                  strokeDasharray="5 5"
                  name="Corporate Margin Floor %"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

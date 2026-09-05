import React from 'react';
import { PipelineHealthStage } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Layers, ArrowRight } from 'lucide-react';
import { DealHealthBadge } from '@/components/deal-health';

interface PipelineHealthChartProps {
  stages: PipelineHealthStage[];
  currency?: string;
}

export function PipelineHealthChart({ stages, currency = '₹' }: PipelineHealthChartProps) {
  const navigate = useNavigate();

  const handleStageClick = (stage: string) => {
    navigate(`/app/pipeline?stage=${stage.toLowerCase()}`);
  };

  const getStageColor = (score: number) => {
    if (score >= 75) return '#10b981'; // emerald
    if (score >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Pipeline Health by Stage</h3>
        </div>
        <span className="text-xs text-slate-400">Click any stage to view in Pipeline</span>
      </div>

      <div className="h-60 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stages}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as PipelineHealthStage;
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 shadow-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-4 font-semibold text-white">
                        <span>{data.label} Stage</span>
                        <DealHealthBadge status={data.healthStatus} size="sm" />
                      </div>
                      <div className="text-slate-300">
                        Deals Count: <strong className="text-white">{data.dealsCount}</strong>
                      </div>
                      <div className="text-slate-300">
                        Total Value: <strong className="text-white font-mono">{currency}{(data.totalValue / 100000).toFixed(1)}L</strong>
                      </div>
                      <div className="text-slate-300">
                        Weighted Value: <strong className="text-emerald-400 font-mono">{currency}{(data.weightedValue / 100000).toFixed(1)}L</strong>
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                        Avg Health Score: <strong className="text-white">{data.avgHealthScore}/100</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="totalValue"
              radius={[4, 4, 0, 0]}
              onClick={(data) => handleStageClick(data.stage)}
              className="cursor-pointer"
            >
              {stages.map((entry, index) => (
                <Cell key={`stage-${index}`} fill={getStageColor(entry.avgHealthScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage quick links grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-800/80">
        {stages.map((st) => (
          <button
            key={st.stage}
            type="button"
            onClick={() => handleStageClick(st.stage)}
            className="flex flex-col p-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/50 border border-slate-800/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>{st.label}</span>
              <ArrowRight className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {st.dealsCount} deals &bull; <span className="font-mono text-white">{currency}{(st.totalValue / 100000).toFixed(1)}L</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

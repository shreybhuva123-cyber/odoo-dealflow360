import React from 'react';
import { DealHealthDetail } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { DealHealthBadge, RiskBadge } from '@/components/deal-health';

interface HighRiskDealsTableProps {
  deals: DealHealthDetail[];
  currency?: string;
}

export function HighRiskDealsTable({ deals, currency = '₹' }: HighRiskDealsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (dealId: string) => {
    navigate(`/app/deal-health/${dealId}`);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm backdrop-blur space-y-0">
      <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">
            High-Risk & Critical Deals Requiring Attention
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Showing {deals.length} deals &bull; Click any row to inspect signals & timeline
        </span>
      </div>

      {deals.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 space-y-2">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            ✓
          </div>
          <p className="font-semibold text-white">No High-Risk Deals Found</p>
          <p className="text-slate-500 max-w-sm mx-auto">
            All deals matching current filter criteria are within healthy compliance parameters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="py-3.5 pl-5 pr-3 font-medium">Deal & Customer</th>
                <th scope="col" className="px-3 py-3.5 font-medium">Owner</th>
                <th scope="col" className="px-3 py-3.5 font-medium text-right">Value</th>
                <th scope="col" className="px-3 py-3.5 font-medium text-center">Health</th>
                <th scope="col" className="px-3 py-3.5 font-medium text-center">Risk</th>
                <th scope="col" className="px-3 py-3.5 font-medium">Primary Anomaly / Reason</th>
                <th scope="col" className="px-3 py-3.5 font-medium">Expected Close</th>
                <th scope="col" className="py-3.5 pl-3 pr-5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deals.map((deal) => (
                <tr
                  key={deal.dealId}
                  onClick={() => handleRowClick(deal.dealId)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {deal.dealName}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{deal.customerName}</span>
                      {deal.customerTier && (
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                          {deal.customerTier}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3.5 text-xs text-slate-300 whitespace-nowrap">
                    {deal.ownerName}
                  </td>

                  <td className="px-3 py-3.5 text-right font-mono font-semibold text-white whitespace-nowrap">
                    {currency}{(deal.value / 100000).toFixed(1)}L
                  </td>

                  <td className="px-3 py-3.5 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <DealHealthBadge status={deal.healthStatus} size="sm" />
                      <span className="text-[10px] font-mono text-slate-400">
                        Score: {deal.healthScore}/100
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3.5 text-center whitespace-nowrap">
                    <RiskBadge level={deal.riskLevel} size="sm" />
                  </td>

                  <td className="px-3 py-3.5 text-xs max-w-xs">
                    <div className="text-rose-300 font-medium line-clamp-2">
                      {deal.primaryRiskReason || 'Margin or discount anomaly detected'}
                    </div>
                    {deal.isStalled && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Stalled for {deal.stalledDays} days</span>
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {deal.expectedCloseDate}
                  </td>

                  <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span>Analyze</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fulfillment, Role } from '@/types';
import { FulfillmentStatusBadge, FulfillmentPriorityBadge } from './FulfillmentStatusBadge';
import { ROUTES } from '@/constants/routes';

interface FulfillmentTableProps {
  fulfillments: Fulfillment[];
  userRole?: Role | null;
  onAllocate?: (order: Fulfillment) => void;
  onUpdateStatus?: (order: Fulfillment, newStatus: any) => void;
  className?: string;
}

export function FulfillmentTable({
  fulfillments,
  userRole,
  onAllocate,
  onUpdateStatus,
  className = '',
}: FulfillmentTableProps) {
  const navigate = useNavigate();

  const isOpsOrAdmin =
    userRole === 'ADMIN' ||
    userRole === 'WAREHOUSE_OPS' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER';

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="overflow-x-auto">
        <table className="table w-full text-xs">
          <thead>
            <tr
              style={{
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-3 px-4 font-semibold text-left">Fulfillment</th>
              <th className="py-3 px-4 font-semibold text-left">Customer</th>
              <th className="py-3 px-4 font-semibold text-left">Deal Reference</th>
              <th className="py-3 px-4 font-semibold text-left">Items Allocation</th>
              <th className="py-3 px-4 font-semibold text-left">Warehouse Hub</th>
              <th className="py-3 px-4 font-semibold text-left">Status</th>
              <th className="py-3 px-4 font-semibold text-left">Priority</th>
              <th className="py-3 px-4 font-semibold text-left">Created</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {fulfillments.map((f) => {
              const allocationPct =
                f.totalItems > 0 ? Math.round((f.allocatedItems / f.totalItems) * 100) : 0;

              return (
                <tr
                  key={f.id}
                  className="hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.APP.FULFILLMENT_DETAIL(f.id))}
                >
                  {/* Fulfillment ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">
                    <span className="hover:underline">{f.id}</span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{f.customerName}</div>
                    {f.quotationNumber && (
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Quote: {f.quotationNumber}
                      </div>
                    )}
                  </td>

                  {/* Deal */}
                  <td className="py-3.5 px-4">
                    {f.dealName ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (f.dealId) navigate(ROUTES.APP.PIPELINE_DETAIL(f.dealId));
                        }}
                        className="text-foreground hover:text-accent hover:underline"
                      >
                        {f.dealName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-foreground">
                        {f.allocatedItems} / {f.totalItems}
                      </span>
                      <div
                        className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"
                        title={`${allocationPct}% allocated`}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${allocationPct}%`,
                            background:
                              allocationPct === 100
                                ? 'var(--green)'
                                : allocationPct > 0
                                ? 'var(--amber)'
                                : 'var(--text-dim)',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Warehouse */}
                  <td className="py-3.5 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>🏭</span>
                      <span className="truncate max-w-[130px]">
                        {f.primaryWarehouseName || 'Auto Split'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <FulfillmentStatusBadge status={f.status} size="sm" />
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <FulfillmentPriorityBadge priority={f.priority} size="sm" />
                  </td>

                  {/* Created */}
                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {formatDate(f.createdAt)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {isOpsOrAdmin && f.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onAllocate) onAllocate(f);
                            else navigate(ROUTES.APP.FULFILLMENT_DETAIL(f.id));
                          }}
                          className="btn btn-primary btn-xs text-[11px]"
                        >
                          Allocate
                        </button>
                      )}

                      {isOpsOrAdmin && f.status === 'allocated' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus?.(f, 'processing')}
                          className="btn btn-warning btn-xs text-[11px]"
                        >
                          Process
                        </button>
                      )}

                      {isOpsOrAdmin && f.status === 'processing' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus?.(f, 'ready')}
                          className="btn btn-xs text-[11px]"
                          style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818CF8',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                          }}
                        >
                          Mark Ready
                        </button>
                      )}

                      {isOpsOrAdmin && f.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus?.(f, 'shipped')}
                          className="btn btn-success btn-xs text-[11px]"
                        >
                          Dispatch 🚚
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.APP.FULFILLMENT_DETAIL(f.id))}
                        className="btn btn-ghost btn-xs text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Details →
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingSchedule, Role } from '@/types';
import { useUpdateBillingSchedule } from '@/hooks/useBilling';
import { ROUTES } from '@/constants/routes';

interface BillingScheduleTableProps {
  schedules: BillingSchedule[];
  userRole?: Role | null;
  className?: string;
}

export function BillingScheduleTable({
  schedules,
  userRole,
  className = '',
}: BillingScheduleTableProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateBillingSchedule();

  const isFinance =
    userRole === 'ADMIN' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER';

  const formatCurrency = (val: number, currency = '₹') => {
    if (val >= 100000) {
      return `${currency}${(val / 100000).toFixed(1)} L`;
    }
    return `${currency}${val.toLocaleString()}`;
  };

  const handleToggleStatus = (sch: BillingSchedule) => {
    const nextStatus = sch.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateMutation.mutate({
      id: sch.id,
      data: { status: nextStatus },
    });
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="card-header py-3 px-4 flex items-center justify-between">
        <div>
          <h3 className="card-title text-xs font-bold text-foreground">
            Contract Billing & Milestone Schedules
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Recurring subscription cadences and deliverable-linked invoicing triggers
          </p>
        </div>
      </div>

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
              <th className="py-2.5 px-4 text-left font-semibold">Schedule ID</th>
              <th className="py-2.5 px-4 text-left font-semibold">Client Account</th>
              <th className="py-2.5 px-4 text-left font-semibold">Deal Reference</th>
              <th className="py-2.5 px-4 text-left font-semibold">Frequency</th>
              <th className="py-2.5 px-4 text-left font-semibold">Next Invoicing</th>
              <th className="py-2.5 px-4 text-right font-semibold">Schedule Amount</th>
              <th className="py-2.5 px-4 text-left font-semibold">Status</th>
              <th className="py-2.5 px-4 text-right font-semibold">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {schedules.map((sch) => (
              <tr key={sch.id} className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-accent">{sch.id}</td>
                <td className="py-3 px-4 font-semibold text-foreground">{sch.customerName}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {sch.dealName ? (
                    <span
                      onClick={() => sch.dealId && navigate(ROUTES.APP.PIPELINE_DETAIL(sch.dealId))}
                      className="hover:text-accent hover:underline cursor-pointer"
                    >
                      {sch.dealName}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-blue text-[10px]">{sch.frequency || sch.interval}</span>
                </td>
                <td className="py-3 px-4 font-mono text-muted-foreground">
                  {sch.nextBillingDate || 'On Delivery'}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                  {formatCurrency(sch.amount, sch.currency)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`badge ${
                      sch.status === 'ACTIVE'
                        ? 'badge-green'
                        : sch.status === 'PAUSED'
                        ? 'badge-amber'
                        : 'badge-gray'
                    } text-[10px]`}
                  >
                    {sch.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {isFinance && sch.status !== 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(sch)}
                      disabled={updateMutation.isPending}
                      className={`btn btn-xs text-[10px] ${
                        sch.status === 'ACTIVE' ? 'btn-ghost text-amber-400' : 'btn-ghost text-green-400'
                      }`}
                    >
                      {sch.status === 'ACTIVE' ? 'Pause Cadence' : 'Resume Cadence'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

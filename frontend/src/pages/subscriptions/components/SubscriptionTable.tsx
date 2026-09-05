import React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  PauseCircle,
  PlayCircle,
  XCircle,
  Receipt,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SubscriptionTable({
  subscriptions,
  onPause,
  onResume,
  onCancel,
}: SubscriptionTableProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[180px] font-semibold text-xs">Subscription / Customer</TableHead>
              <TableHead className="font-semibold text-xs">Plan & Tier</TableHead>
              <TableHead className="font-semibold text-xs text-right">MRR</TableHead>
              <TableHead className="font-semibold text-xs text-right">ARR</TableHead>
              <TableHead className="font-semibold text-xs">Billing Cadence</TableHead>
              <TableHead className="font-semibold text-xs">Next Billing / Renewal</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="w-[80px] text-right font-semibold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow
                key={sub.id}
                className="group hover:bg-muted/30 transition-colors border-b border-border/40"
              >
                {/* ID & Customer */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <Link
                      to={`/app/subscriptions/${sub.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-primary/70" />
                      {sub.id}
                    </Link>
                    <div className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {sub.customerName}
                    </div>
                  </div>
                </TableCell>

                {/* Plan & Tier */}
                <TableCell className="py-3.5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-foreground truncate max-w-[220px]">
                      {sub.planName}
                    </div>
                    {sub.planTier && (
                      <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground border border-border/50">
                        {sub.planTier}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* MRR */}
                <TableCell className="py-3.5 text-right font-mono text-xs font-bold text-primary">
                  {formatCurrency(sub.mrr, sub.currency)}
                </TableCell>

                {/* ARR */}
                <TableCell className="py-3.5 text-right font-mono text-xs font-bold text-emerald-400">
                  {formatCurrency(sub.arr, sub.currency)}
                </TableCell>

                {/* Billing Cycle */}
                <TableCell className="py-3.5">
                  <div className="text-xs font-medium text-foreground">
                    {sub.frequency || sub.billingCycle}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {sub.autoRenew ? 'Auto-renews' : 'Manual renewal'}
                  </div>
                </TableCell>

                {/* Next Billing / Renewal */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Next: {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : '—'}</span>
                  </div>
                  {sub.renewalDate && (
                    <div className="text-[11px] text-muted-foreground pl-5 font-mono">
                      Renews: {formatDate(sub.renewalDate)}
                    </div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5">
                  <SubscriptionStatusBadge status={sub.status} size="sm" />
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3.5 text-right">
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100 flex items-center justify-center rounded-md hover:bg-muted/50"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    align="right"
                    className="w-48 bg-card border-border/80"
                  >
                    <DropdownMenuItem>
                      <Link
                        to={`/app/subscriptions/${sub.id}`}
                        className="flex items-center gap-2 w-full text-xs text-foreground"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        View Contract
                      </Link>
                    </DropdownMenuItem>

                    {sub.quotationId && (
                      <DropdownMenuItem>
                        <Link
                          to={`/app/quotations/${sub.quotationId}`}
                          className="flex items-center gap-2 w-full text-xs text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          View Quotation
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem>
                      <Link
                        to={`/app/invoices?customer=${encodeURIComponent(sub.customerName)}`}
                        className="flex items-center gap-2 w-full text-xs text-foreground"
                      >
                        <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                        View Invoices ({sub.invoicesCount || 0})
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-border/60 my-1" />

                    {sub.status === 'active' && onPause && (
                      <DropdownMenuItem
                        onClick={() => onPause(sub.id)}
                        className="text-amber-400 focus:text-amber-400"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <PauseCircle className="w-3.5 h-3.5" />
                          Pause Subscription
                        </div>
                      </DropdownMenuItem>
                    )}

                    {sub.status === 'paused' && onResume && (
                      <DropdownMenuItem
                        onClick={() => onResume(sub.id)}
                        className="text-emerald-400 focus:text-emerald-400"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Resume Subscription
                        </div>
                      </DropdownMenuItem>
                    )}

                    {sub.status !== 'cancelled' && onCancel && (
                      <DropdownMenuItem
                        onClick={() => onCancel(sub.id)}
                        className="text-rose-400 focus:text-rose-400"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel Subscription
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

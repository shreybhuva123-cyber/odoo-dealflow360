import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showToast } from '@/stores/toast.store';
import { ROUTES } from '@/constants/routes';
import { useInvoices } from '@/hooks/useInvoices';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/utils/formatters';
import {
  Receipt,
  Layers,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function QuotationBillingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCancelled, setIsCancelled] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Match connected invoices and subscriptions
  const { data: allInvoices = [] } = useInvoices();
  const { data: allSubs = [] } = useSubscriptions();

  const linkedInvoices = allInvoices.filter(
    (inv) => inv.quotationId === id || inv.quotationNumber === id
  );
  const linkedSub = allSubs.find(
    (s) => s.quotationId === id || s.quotationNumber === id
  );

  const handleModify = () => {
    setIsModified(true);
    showToast('Subscription modified — credit note issued', 'amber');
  };

  const handleCancel = () => {
    setIsCancelled(true);
    showToast('Subscription cancelled — partial refund calculated', 'red');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.APP.QUOTATION_DETAIL(id))}
            className="text-xs"
          >
            ← Back to Quote
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Billing & Recurring Schedule · {id || 'Q-1041'}
            </h1>
            <p className="text-xs text-muted-foreground">
              Subscription cadence, milestone billings, proration rules, and credit notes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {linkedInvoices.length > 0 && (
            <Link
              to={`/app/invoices/${linkedInvoices[0].id}`}
              className={cn(buttonVariants({ size: 'sm' }), 'text-xs bg-primary text-primary-foreground')}
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              View Invoice ({linkedInvoices[0].invoiceNumber})
            </Link>
          )}

          {linkedSub && (
            <Link
              to={`/app/subscriptions/${linkedSub.id}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs border-border/80')}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Manage Contract ({linkedSub.id})
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Lines Card */}
        <Card className="bg-card/70 border-border/70 shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-semibold text-foreground">
              Contract Product Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* One-Time Products */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                One-Time Hardware & Services
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <span className="font-semibold text-foreground">Enterprise Server Nodes × 2</span>
                  <span className="font-mono font-bold text-foreground">₹2,80,000</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <span className="font-semibold text-foreground">Initial Setup & Architecture Deployment</span>
                  <span className="font-mono font-bold text-foreground">₹45,000</span>
                </div>
              </div>
            </div>

            {/* Recurring Lines */}
            <div className="pt-2">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                Recurring SaaS Subscriptions
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">CloudBase Pro Suite</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      Monthly
                    </span>
                  </div>
                  <span className="font-mono font-bold text-primary">₹25,000 / mo</span>
                </div>

                <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">24/7 Enterprise SLA Support</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      Monthly
                    </span>
                  </div>
                  <span className="font-mono font-bold text-primary">₹12,500 / mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Schedule Card */}
        <Card className="bg-card/70 border-border/70 shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Billing Schedule & Milestones
            </CardTitle>
            {isCancelled && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Subscription Cancelled
              </span>
            )}
            {isModified && !isCancelled && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Modified
              </span>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                <span className="text-muted-foreground">Milestone 1 (Hardware Delivery)</span>
                <span className="font-mono font-bold text-foreground">₹3,25,000 · Invoiced</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                <span className="text-muted-foreground">Recurring Cycle 1 (Oct 1, 2026)</span>
                <span className="font-mono font-bold text-primary">₹37,500 / mo</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                <span className="text-muted-foreground">Recurring Cycle 2 (Nov 1, 2026)</span>
                <span className="font-mono font-bold text-primary">₹37,500 / mo</span>
              </div>
            </div>

            {/* Proration Banner */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Mid-cycle proration active. Any seat count changes on or after 15th will automatically calculate credit adjustment notes on the following invoice.
              </span>
            </div>

            {/* Schedule Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleModify}
                disabled={isCancelled}
                className="text-xs border-border/80"
              >
                Modify Subscription
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelled}
                className="text-xs"
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

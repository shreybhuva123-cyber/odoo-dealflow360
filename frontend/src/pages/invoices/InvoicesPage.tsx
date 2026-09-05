import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInvoices, useSendPaymentReminder } from '@/hooks/useInvoices';
import { Invoice } from '@/types';
import {
  InvoiceFilters,
  InvoiceTable,
  RecordPaymentDialog,
  SendReminderDialog,
  InvoiceTableSkeleton,
  InvoiceEmptyState,
} from './components';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { showToast } from '@/stores/toast.store';
import {
  Receipt,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Download,
} from 'lucide-react';
import { downloadInvoiceCsv, downloadInvoicePdf } from '@/utils/invoiceDownload';

export function InvoicesPage() {
  const [searchParams] = useSearchParams();
  const customerParam = searchParams.get('customer') || '';

  const [search, setSearch] = useState(customerParam);
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filterOptions = useMemo(() => {
    return {
      search: search.trim() || undefined,
      status: status !== 'all' ? (status as any) : undefined,
    };
  }, [search, status]);

  const { data: invoices = [], isLoading, refetch } = useInvoices(filterOptions);
  const sendReminderMutation = useSendPaymentReminder();

  // Dialog states
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);

  // Compute aggregate metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      totalBilled += inv.total;
      totalPaid += inv.amountPaid;
      totalOutstanding += inv.balanceDue;
      if (inv.status === 'overdue') {
        totalOverdue += inv.balanceDue;
      }
    });

    return {
      totalBilled,
      totalPaid,
      totalOutstanding,
      totalOverdue,
      count: invoices.length,
    };
  }, [invoices]);

  const handleExportCSV = () => {
    downloadInvoiceCsv(invoices);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setDateRange('all');
  };

  const isFiltered = search.trim() !== '' || status !== 'all' || dateRange !== 'all';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Invoices & Receivables
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track billed orders, collect payments, manage customer balance reconciliation and automated overdue recovery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs border-border/80')}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>
          <Link
            to="/app/quotations"
            className={cn(buttonVariants({ size: 'sm' }), 'text-xs bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Invoice from Quotation
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-foreground">
            {formatCurrency(metrics.totalBilled)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.count} invoices generated
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Outstanding Balance</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-amber-400">
            {formatCurrency(metrics.totalOutstanding)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Awaiting customer payment
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Overdue Recovery</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-rose-400">
            {formatCurrency(metrics.totalOverdue)}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1 font-medium">
            Requires dunning notice
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Cash Settled</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-emerald-400">
            {formatCurrency(metrics.totalPaid)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Reconciled to bank ledger
          </div>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <InvoiceFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
      />

      {/* Main Table or Loading/Empty State */}
      {isLoading ? (
        <InvoiceTableSkeleton />
      ) : invoices.length === 0 ? (
        <InvoiceEmptyState
          isFiltered={isFiltered}
          onReset={handleReset}
        />
      ) : (
        <InvoiceTable
          invoices={invoices}
          onRecordPayment={(inv) => setPaymentInvoice(inv)}
          onSendReminder={(inv) => setReminderInvoice(inv)}
          onDownloadPdf={(inv) => downloadInvoicePdf(inv)}
        />
      )}

      {/* Record Payment Dialog */}
      {paymentInvoice && (
        <RecordPaymentDialog
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={() => {
            setPaymentInvoice(null);
            refetch();
          }}
        />
      )}

      {/* Send Overdue Reminder Dialog */}
      {reminderInvoice && (
        <SendReminderDialog
          invoice={reminderInvoice}
          isOpen={!!reminderInvoice}
          onClose={() => setReminderInvoice(null)}
          onConfirm={async () => {
            await sendReminderMutation.mutateAsync(reminderInvoice.id);
            setReminderInvoice(null);
            refetch();
          }}
          isSending={sendReminderMutation.isPending}
        />
      )}
    </div>
  );
}

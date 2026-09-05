import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useInvoice,
  useRecordPayment,
  useSendInvoice,
  useSendPaymentReminder,
} from '@/hooks/useInvoices';
import {
  InvoiceHeader,
  InvoiceItems,
  InvoiceSummary,
  PaymentStatus,
  PaymentHistory,
  RecordPaymentDialog,
  SendReminderDialog,
  InvoiceDetailSkeleton,
} from './components';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showToast } from '@/stores/toast.store';
import { downloadInvoicePdf, downloadInvoiceHtml } from '@/utils/invoiceDownload';
import {
  Building2,
  FileText,
  Truck,
  Briefcase,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId || '');

  const recordPaymentMutation = useRecordPayment();
  const sendInvoiceMutation = useSendInvoice();
  const sendReminderMutation = useSendPaymentReminder();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <InvoiceDetailSkeleton />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested invoice #{invoiceId} could not be located or has been archived.
        </p>
        <Link to="/app/invoices" className={cn(buttonVariants({ variant: 'outline' }))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  const handleSendInvoice = async () => {
    try {
      await sendInvoiceMutation.mutateAsync(invoice.id);
      refetch();
    } catch (e) {
      // Error handled by mutation
    }
  };

  const handleDownloadPdf = () => {
    if (invoice) {
      downloadInvoicePdf(invoice);
    }
  };

  const handleDownloadHtml = () => {
    if (invoice) {
      downloadInvoiceHtml(invoice);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action Controls */}
      <InvoiceHeader
        invoice={invoice}
        onRecordPayment={() => setIsPaymentOpen(true)}
        onSendInvoice={handleSendInvoice}
        onSendReminder={() => setIsReminderOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onDownloadHtml={handleDownloadHtml}
        isSending={sendInvoiceMutation.isPending || recordPaymentMutation.isPending}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Details, Items, and Payment History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bill To & Metadata Card */}
          <Card className="bg-card/70 border-border/70 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/40">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>Billing Details</span>
                <span className="font-mono text-primary font-bold">Terms: {invoice.paymentTerms}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {invoice.billTo?.company || invoice.customerName}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
                    <p>{invoice.billTo?.name || invoice.customerName}</p>
                    <p>{invoice.billTo?.address || '100 Innovation Boulevard, Tech Park'}</p>
                    <p>
                      {invoice.billTo?.city || 'Bengaluru'}, {invoice.billTo?.state || 'KA'}{' '}
                      {invoice.billTo?.postalCode || '560100'}, {invoice.billTo?.country || 'India'}
                    </p>
                    {invoice.billTo?.taxId && (
                      <p className="font-mono text-[11px] pt-1 text-foreground">
                        GSTIN: {invoice.billTo.taxId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-2/40 rounded-xl p-4 border border-border/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Invoice Date:</span>
                    <span className="font-mono font-medium text-foreground">{invoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Due Date:</span>
                    <span className="font-mono font-medium text-foreground">{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Currency:</span>
                    <span className="font-mono font-medium text-foreground">{invoice.currency} (INR)</span>
                  </div>
                  {invoice.lastReminderSentAt && (
                    <div className="flex justify-between items-center text-rose-400">
                      <span>Last Reminder:</span>
                      <span className="font-mono">{invoice.lastReminderSentAt}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <InvoiceItems items={invoice.items} currency={invoice.currency} />

          {/* Payment History Audit Ledger */}
          <PaymentHistory
            payments={invoice.payments}
            currency={invoice.currency}
          />

          {/* Notes / Special Instructions */}
          {invoice.notes && (
            <Card className="bg-card/70 border-border/70 p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Terms & Bank Wire Instructions
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-surface-2/30 p-3 rounded-lg border border-border/40 font-mono">
                {invoice.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right 4 Cols: Payment Status, Summary, and Linked Entities */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Status Bar Gauge */}
          <PaymentStatus invoice={invoice} />

          {/* Financial Calculation Breakdown */}
          <InvoiceSummary invoice={invoice} />

          {/* Linked Deal / Quotation / Fulfillment Entity Card */}
          <Card className="bg-card/70 border-border/70 p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Commercial Flow
            </div>

            <div className="space-y-2.5 text-xs">
              {invoice.dealId && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Pipeline Deal</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {invoice.dealName || invoice.dealId}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/app/pipeline/${invoice.dealId}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 text-primary')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {invoice.quotationId && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium text-foreground">Sales Quotation</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {invoice.quotationNumber || invoice.quotationId}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/app/quotations/${invoice.quotationId}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 text-emerald-400')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {invoice.fulfillmentId && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-medium text-foreground">Warehouse Order</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {invoice.fulfillmentNumber || invoice.fulfillmentId}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/app/fulfillment/${invoice.fulfillmentId}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 text-cyan-400')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Record Payment Dialog */}
      {isPaymentOpen && (
        <RecordPaymentDialog
          invoice={invoice}
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            refetch();
          }}
        />
      )}

      {/* Send Overdue Reminder Dialog */}
      {isReminderOpen && (
        <SendReminderDialog
          invoice={invoice}
          isOpen={isReminderOpen}
          onClose={() => setIsReminderOpen(false)}
          onConfirm={async () => {
            await sendReminderMutation.mutateAsync(invoice.id);
            setIsReminderOpen(false);
            refetch();
          }}
          isSending={sendReminderMutation.isPending}
        />
      )}
    </div>
  );
}

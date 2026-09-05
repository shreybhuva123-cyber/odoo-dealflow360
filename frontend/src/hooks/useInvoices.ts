import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/services/api/invoices.api';
import { InvoiceFilterOptions, Payment } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useInvoices(filters?: InvoiceFilterOptions) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoicesApi.getInvoices(filters),
    staleTime: 30000,
  });
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getInvoice(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function usePayments(invoiceId?: string) {
  return useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => (invoiceId ? invoicesApi.getPayments(invoiceId) : []),
    enabled: !!invoiceId,
    staleTime: 30000,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: {
        amount: number;
        method: Payment['method'];
        reference: string;
        paymentDate: string;
        notes?: string;
        recordedBy?: string;
      };
    }) => invoicesApi.recordPayment(invoiceId, payload),
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', updatedInvoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', updatedInvoice.id] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      showToast(`Payment of ₹${payloadAmountFormatted(updatedInvoice.payments[0]?.amount)} recorded successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to record payment', 'red');
    },
  });
}

function payloadAmountFormatted(amount?: number) {
  if (!amount) return '0';
  return amount.toLocaleString();
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      quotationId?: string;
      quotationNumber?: string;
      dealId?: string;
      dealName?: string;
      fulfillmentId?: string;
      fulfillmentNumber?: string;
      customerId: string;
      customerName: string;
      customerEmail?: string;
      items: {
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
      }[];
      discount?: number;
      paymentTerms?: string;
      dueDate?: string;
    }) => invoicesApi.createInvoice(payload),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      showToast(`Invoice ${newInvoice.invoiceNumber} generated successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to create invoice', 'red');
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoicesApi.sendInvoice(invoiceId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showToast(`Invoice ${invoice.invoiceNumber} transmitted to client`, 'blue');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to transmit invoice', 'red');
    },
  });
}

export function useSendPaymentReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoicesApi.sendPaymentReminder(invoiceId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showToast(`Payment reminder dispatch triggered for ${invoice.invoiceNumber}`, 'amber');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to send payment reminder', 'red');
    },
  });
}

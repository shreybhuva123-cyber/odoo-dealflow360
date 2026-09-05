import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerPortalApi } from '@/services/api/customerPortal.api';
import { negotiationsApi } from '@/services/api/negotiations.api';
import { NegotiationItemRequest } from '@/types';
import { showToast } from '@/stores/toast.store';

export function useRecordQuoteView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token }: { token: string }) =>
      customerPortalApi.recordQuoteView(token),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-quote', token] });
      queryClient.invalidateQueries({ queryKey: ['portal-quote-activity', token] });
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      payload,
    }: {
      token: string;
      payload: {
        signatoryName: string;
        signatoryEmail: string;
        signatoryTitle?: string;
        notes?: string;
      };
    }) => customerPortalApi.acceptCustomerQuote(token, payload),
    onSuccess: (data, { token }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-quote', token] });
      queryClient.invalidateQueries({ queryKey: ['portal-quote-activity', token] });
      showToast('Quotation successfully accepted & confirmed!', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to accept quotation', 'red');
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      payload,
    }: {
      token: string;
      payload: {
        reason: string;
        customerName?: string;
      };
    }) => customerPortalApi.rejectCustomerQuote(token, payload),
    onSuccess: (data, { token }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-quote', token] });
      queryClient.invalidateQueries({ queryKey: ['portal-quote-activity', token] });
      showToast('Quotation decline recorded. Thank you for your feedback.', 'blue');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to decline quotation', 'red');
    },
  });
}

export function useSubmitNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      payload,
    }: {
      token: string;
      payload: {
        items: NegotiationItemRequest[];
        message: string;
        customerName: string;
        customerEmail?: string;
      };
    }) => negotiationsApi.submitNegotiation(token, payload),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ['portal-quote', token] });
      queryClient.invalidateQueries({ queryKey: ['portal-quote-activity', token] });
      queryClient.invalidateQueries({ queryKey: ['portal-negotiation', token] });
      showToast('Counter-proposal submitted to sales representative!', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to submit negotiation request', 'red');
    },
  });
}

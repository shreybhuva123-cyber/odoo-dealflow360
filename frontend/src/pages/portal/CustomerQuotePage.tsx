import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCustomerQuote,
  useCustomerQuoteActivity,
  useRecordQuoteView,
  useAcceptQuote,
  useRejectQuote,
} from '@/hooks/portal';
import {
  CustomerQuoteHeader,
  CustomerQuoteItems,
  CustomerPricingSummary,
  QuoteActions,
  AcceptQuoteDialog,
  RejectQuoteDialog,
  CustomerNegotiationTimeline,
  QuoteComparison,
  QuoteExpiredState,
  PortalErrorState,
  CustomerQuoteSkeleton,
} from './components';

export function CustomerQuotePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data: quote, isLoading, error } = useCustomerQuote(token);
  const { data: activity } = useCustomerQuoteActivity(token);

  const recordView = useRecordQuoteView();
  const acceptMutation = useAcceptQuote();
  const rejectMutation = useRejectQuote();

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Track if view has been recorded for this session
  const viewRecordedRef = useRef(false);

  useEffect(() => {
    if (quote && token && !viewRecordedRef.current && quote.status === 'awaiting_response') {
      viewRecordedRef.current = true;
      recordView.mutate({ token });
    }
  }, [quote, token, recordView]);

  if (isLoading) {
    return <CustomerQuoteSkeleton />;
  }

  if (error || !quote || !token) {
    return (
      <PortalErrorState message="The quotation link you accessed is invalid, expired, or has been revoked." />
    );
  }

  const isExpired = quote.status === 'expired';

  const handleConfirmAccept = async (payload: {
    signatoryName: string;
    signatoryEmail: string;
    signatoryTitle?: string;
    notes?: string;
  }) => {
    await acceptMutation.mutateAsync({ token, payload });
    // Navigate to confirmation page
    navigate(`/portal/quote/${token}/confirmation`);
  };

  const handleConfirmReject = async (payload: { reason: string; customerName?: string }) => {
    await rejectMutation.mutateAsync({ token, payload });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Quote ID, Expiration countdown, and Rep info */}
      <CustomerQuoteHeader quote={quote} onDownloadPdf={handlePrintPdf} />

      {/* If offer is expired, show prominent notice */}
      {isExpired ? (
        <QuoteExpiredState quote={quote} />
      ) : (
        <>
          {/* Version comparison if revised quote */}
          <QuoteComparison quote={quote} />

          {/* Line items (clean, margin/risk-free) */}
          <CustomerQuoteItems items={quote.items} currency={quote.currency} />

          {/* Pricing summary, tax breakdown, terms */}
          <CustomerPricingSummary quote={quote} />
        </>
      )}

      {/* Customer-safe Activity & Negotiation History */}
      {activity && activity.length > 0 && (
        <CustomerNegotiationTimeline events={activity} />
      )}

      {/* Floating Action Bar */}
      {!isExpired && (
        <QuoteActions
          quote={quote}
          token={token}
          onAcceptClick={() => setAcceptModalOpen(true)}
          onRejectClick={() => setRejectModalOpen(true)}
        />
      )}

      {/* Acceptance Modal */}
      <AcceptQuoteDialog
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
        quote={quote}
        onConfirm={handleConfirmAccept}
        isSubmitting={acceptMutation.isPending}
      />

      {/* Rejection Modal */}
      <RejectQuoteDialog
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        quote={quote}
        onConfirm={handleConfirmReject}
        isSubmitting={rejectMutation.isPending}
      />
    </div>
  );
}

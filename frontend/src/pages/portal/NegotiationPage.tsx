import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomerQuote, useNegotiation, useSubmitNegotiation } from '@/hooks/portal';
import {
  NegotiationRequestForm,
  NegotiationSummary,
  CustomerQuoteSkeleton,
  PortalErrorState,
} from './components';
import { ArrowLeft, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import { NegotiationItemRequest } from '@/types';

export function NegotiationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data: quote, isLoading: isQuoteLoading } = useCustomerQuote(token);
  const { data: negotiation, isLoading: isNegLoading } = useNegotiation(token);
  const submitNegotiation = useSubmitNegotiation();

  if (isQuoteLoading || isNegLoading) {
    return <CustomerQuoteSkeleton />;
  }

  if (!quote || !token) {
    return (
      <PortalErrorState message="The negotiation portal link could not be loaded or is invalid." />
    );
  }

  const handleSubmit = async (payload: {
    items: NegotiationItemRequest[];
    message: string;
    customerName: string;
    customerEmail?: string;
  }) => {
    await submitNegotiation.mutateAsync({
      token,
      payload,
    });
    // Return to the main quote page where updated changes_requested status is displayed
    navigate(`/portal/quote/${token}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to={`/portal/quote/${token}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Quotation {quote.quoteNumber}</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Propose Terms & Counter-Offer
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Quotation <span className="font-semibold text-slate-200">{quote.quoteNumber}</span> for{' '}
              <span className="text-slate-300">{quote.customerName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Direct Channel to {quote.salesRepName || 'Sales Management'}</span>
          </div>
        </div>
      </div>

      {/* Existing negotiation record if previously submitted */}
      {negotiation && <NegotiationSummary negotiation={negotiation} />}

      {/* Active Form */}
      {quote.status !== 'accepted' && quote.status !== 'rejected' && (
        <NegotiationRequestForm
          quote={quote}
          onSubmit={handleSubmit}
          isSubmitting={submitNegotiation.isPending}
        />
      )}
    </div>
  );
}

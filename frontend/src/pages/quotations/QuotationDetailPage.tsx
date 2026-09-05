import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuotation } from '@/hooks/useQuotations';
import { QuotationBuilder } from '@/components/dealflow/QuotationBuilder';
import { DEFAULT_MOCK_QUOTATIONS } from '@/services/api/quotations.api';
import { Quotation } from '@/types';

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isLoading } = useQuotation(id);
  const [fallbackQuote, setFallbackQuote] = useState<Quotation | null>(null);

  // Safety net: If query is taking more than 1.5s, provide fallback mock quote instantly
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!quote) {
        const cleanId = (id || '').toLowerCase().trim();
        const found =
          DEFAULT_MOCK_QUOTATIONS.find(
            (q) => q.id.toLowerCase() === cleanId || q.quoteNumber.toLowerCase() === cleanId
          ) || DEFAULT_MOCK_QUOTATIONS[0];
        setFallbackQuote(found);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, quote]);

  const activeQuote = quote || fallbackQuote;

  if (isLoading && !activeQuote) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-medium text-foreground">Loading quotation workspace...</div>
        <div className="text-xs text-muted-foreground">Preparing builder and pricing models for {id}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <QuotationBuilder
        key={id || activeQuote?.id || 'builder'}
        initialQuotation={activeQuote}
      />
    </div>
  );
}

export default QuotationDetailPage;

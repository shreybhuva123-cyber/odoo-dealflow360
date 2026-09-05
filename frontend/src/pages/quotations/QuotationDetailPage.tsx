import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuotation } from '@/hooks/useQuotations';
import { QuotationBuilder } from '@/components/dealflow/QuotationBuilder';

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isLoading } = useQuotation(id);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground">
        Loading quotation workspace...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <QuotationBuilder
        key={id || quote?.id || 'builder'}
        initialQuotation={quote}
      />
    </div>
  );
}

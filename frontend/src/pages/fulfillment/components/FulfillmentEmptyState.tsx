import React from 'react';

interface FulfillmentEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onCreateOrder?: () => void;
}

export function FulfillmentEmptyState({
  isFiltered = false,
  onResetFilters,
  onCreateOrder,
}: FulfillmentEmptyStateProps) {
  return (
    <div
      className="card p-12 text-center"
      style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
    >
      <div className="text-4xl mb-3">📦</div>
      <h3 className="text-sm font-bold text-foreground mb-1">
        {isFiltered ? 'No Matching Fulfillment Orders' : 'No Fulfillment Records'}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
        {isFiltered
          ? 'Try adjusting your search queries or clearing active status and warehouse filters.'
          : 'Approved quotations ready for physical fulfillment will automatically appear here for allocation.'}
      </p>

      <div className="flex justify-center gap-3">
        {isFiltered && onResetFilters && (
          <button type="button" onClick={onResetFilters} className="btn btn-ghost btn-sm text-xs">
            Reset Filters
          </button>
        )}
        {onCreateOrder && (
          <button type="button" onClick={onCreateOrder} className="btn btn-primary btn-sm text-xs">
            + Create Manual Fulfillment
          </button>
        )}
      </div>
    </div>
  );
}

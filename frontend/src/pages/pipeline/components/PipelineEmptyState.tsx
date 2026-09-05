import React from 'react';

interface PipelineEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenNewDeal: () => void;
}

export const PipelineEmptyState: React.FC<PipelineEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  onOpenNewDeal,
}) => {
  return (
    <div className="card text-center py-16 px-4">
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>
        {hasFilters ? '🔍' : '🗂️'}
      </div>
      <div className="text-base font-bold text-foreground">
        {hasFilters ? 'No Deals Match Current Filters' : 'No Deals in Pipeline Yet'}
      </div>
      <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
        {hasFilters
          ? 'Try adjusting your search query, owner, stage, or health filters to find opportunities.'
          : 'Create your first enterprise deal opportunity to begin tracking pipeline stages and forecasting.'}
      </p>
      <div className="flex items-center justify-center gap-3">
        {hasFilters ? (
          <button className="btn btn-ghost btn-sm text-xs" onClick={onClearFilters}>
            Clear All Filters
          </button>
        ) : null}
        <button className="btn btn-primary btn-sm text-xs font-semibold" onClick={onOpenNewDeal}>
          + Create First Deal
        </button>
      </div>
    </div>
  );
};

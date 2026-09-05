import React from 'react';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

export function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="px-4 py-2.5 bg-surface2/30 border-b border-border/50">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <span>🕒</span>
          <span>Recent Searches</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {searches.map((term, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(term)}
            className="px-2.5 py-1 rounded-md text-xs bg-surface border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/60 transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>🔍</span>
            <span>{term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

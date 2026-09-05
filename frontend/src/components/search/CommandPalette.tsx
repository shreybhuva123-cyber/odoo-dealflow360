import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/stores/search.store';
import { useGlobalSearch, useRecentSearches } from '@/hooks/useGlobalSearch';
import { RecentSearches } from './RecentSearches';
import { SearchResultItem } from '@/types';
import { ROUTES } from '@/constants/routes';

interface QuickAction {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'CREATION' | 'ADMIN';
  icon: string;
  route: string;
  shortcut?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new_quote', title: 'Create New Quotation', category: 'CREATION', icon: '📝', route: ROUTES.APP.QUOTATION_NEW || '/app/quotations/new' },
  { id: 'new_deal', title: 'Create Pipeline Deal', category: 'CREATION', icon: '🚀', route: ROUTES.APP.PIPELINE || '/app/pipeline' },
  { id: 'nav_notif', title: 'Notification Center', category: 'NAVIGATION', icon: '🔔', route: '/app/notifications', shortcut: 'G then N' },
  { id: 'nav_audit', title: 'Compliance Audit Logs', category: 'ADMIN', icon: '📜', route: '/app/audit-logs', shortcut: 'G then L' },
  { id: 'nav_approvals', title: 'Approval Queue & Sign-offs', category: 'NAVIGATION', icon: '⏳', route: '/app/approvals', shortcut: 'G then A' },
  { id: 'nav_health', title: 'Deal Health & Risk Intelligence', category: 'NAVIGATION', icon: '📊', route: '/app/deal-health', shortcut: 'G then H' },
  { id: 'nav_products', title: 'Product Catalog & Pricing Rules', category: 'NAVIGATION', icon: '📦', route: '/app/products', shortcut: 'G then P' },
  { id: 'nav_fulfill', title: 'Fulfillment & Warehouse Inventory', category: 'NAVIGATION', icon: '🚚', route: '/app/fulfillment' },
  { id: 'nav_invoices', title: 'Invoices & Customer Billing', category: 'NAVIGATION', icon: '🧾', route: '/app/invoices' },
];

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette } = useSearchStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading } = useGlobalSearch(query);
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  // Filtered quick actions if query is present
  const matchingActions = QUICK_ACTIONS.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase())
  );

  // Combine actions + results into a single navigable list
  const allItems: Array<{ type: 'ACTION' | 'RESULT'; data: QuickAction | SearchResultItem }> = [
    ...matchingActions.map((a) => ({ type: 'ACTION' as const, data: a })),
    ...results.map((r) => ({ type: 'RESULT' as const, data: r })),
  ];

  // Auto focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length ? (prev + 1) % allItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length ? (prev - 1 + allItems.length) % allItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allItems[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  const handleSelectItem = (item: { type: 'ACTION' | 'RESULT'; data: QuickAction | SearchResultItem }) => {
    if (query.trim()) {
      addSearch(query.trim());
    }
    closeCommandPalette();
    if (item.type === 'ACTION') {
      navigate((item.data as QuickAction).route);
    } else {
      navigate((item.data as SearchResultItem).route);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={closeCommandPalette}
    >
      <div
        className="bg-popover text-popover-foreground border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative p-4 border-b border-border flex items-center gap-3 bg-muted/30">
          <span className="text-muted-foreground text-base">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, deal, quote, customer, product, or invoice..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted"
            >
              Clear
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border/60">
            ESC
          </span>
        </div>

        {/* Recent Searches chips if input is empty */}
        {!query && recentSearches.length > 0 && (
          <RecentSearches
            searches={recentSearches}
            onSelect={(term) => setQuery(term)}
            onClear={clearSearches}
          />
        )}

        {/* Results / Commands list */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 max-h-[420px]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
              <span>Searching across pipeline, quotes, and products...</span>
            </div>
          ) : allItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
              <span className="text-2xl block">🔍</span>
              <p className="font-semibold text-foreground">No matches found for "{query}"</p>
              <p className="text-[11px]">Try searching by customer name, quote number, or SKU.</p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'ACTION') {
                const action = item.data as QuickAction;
                return (
                  <div
                    key={action.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{action.icon}</span>
                      <span className="truncate">{action.title}</span>
                    </div>

                    {action.shortcut && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-accent-foreground/20 text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {action.shortcut}
                      </span>
                    )}
                  </div>
                );
              }

              const res = item.data as SearchResultItem;
              return (
                <div
                  key={`${res.type}-${res.id}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          isSelected
                            ? 'bg-accent-foreground/20 text-accent-foreground font-bold'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {res.type}
                      </span>
                      <span className="truncate font-medium">{res.title}</span>
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {res.subtitle}
                    </div>
                  </div>

                  {res.badge && (
                    <span
                      className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-accent-foreground/20 text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {res.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="text-[10px] text-muted-foreground">DealFlow360 Unified Search</span>
        </div>
      </div>
    </div>
  );
}

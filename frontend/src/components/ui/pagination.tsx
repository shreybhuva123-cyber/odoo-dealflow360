import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, showEdges = false, className, ...props }, ref) => {
    if (totalPages <= 1) return null;

    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination Navigation"
        className={cn(
          'flex items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground select-none',
          className
        )}
        {...props}
      >
        <div>
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {showEdges && (
            <Button
              variant="outline"
              size="xs"
              disabled={!canPrev}
              onClick={() => onPageChange(1)}
              aria-label="Go to first page"
              className="h-7 w-7 p-0"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="xs"
            disabled={!canPrev}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Go to previous page"
            className="h-7 px-2.5 text-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Go to next page"
            className="h-7 px-2.5 text-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          {showEdges && (
            <Button
              variant="outline"
              size="xs"
              disabled={!canNext}
              onClick={() => onPageChange(totalPages)}
              aria-label="Go to last page"
              className="h-7 w-7 p-0"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </nav>
    );
  }
);
Pagination.displayName = 'Pagination';

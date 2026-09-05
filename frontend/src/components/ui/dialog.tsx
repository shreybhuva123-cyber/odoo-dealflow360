import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-50 grid w-full max-w-lg gap-4 rounded-xl border border-border bg-card p-6 shadow-2xl duration-200 animate-in fade-in-0 zoom-in-95',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25',
        outline: 'border-border text-foreground hover:bg-accent hover:text-accent-foreground',
        success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25',
        warning: 'border-amber-500/30 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25',
        info: 'border-sky-500/30 bg-sky-500/15 text-sky-400 hover:bg-sky-500/25',
        purple: 'border-purple-500/30 bg-purple-500/15 text-purple-400 hover:bg-purple-500/25',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

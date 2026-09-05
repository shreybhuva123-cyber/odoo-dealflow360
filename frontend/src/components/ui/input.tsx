import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    const isInvalid = Boolean(error || props['aria-invalid'] === true || props['aria-invalid'] === 'true');
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={errorId || props['aria-describedby']}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            isInvalid && 'border-destructive focus-visible:ring-destructive text-destructive-foreground',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
            {rightIcon}
          </div>
        )}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

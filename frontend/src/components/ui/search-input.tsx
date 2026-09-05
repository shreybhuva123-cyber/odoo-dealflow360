import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './input';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className, wrapperClassName, disabled, ...props }, ref) => {
    const hasValue = Boolean(value);

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className={cn('relative w-full', wrapperClassName)}>
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          rightIcon={
            hasValue && onClear && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                tabIndex={-1}
                className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
          className={cn('transition-shadow focus-visible:ring-1 focus-visible:ring-ring', className)}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

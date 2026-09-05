import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className, ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

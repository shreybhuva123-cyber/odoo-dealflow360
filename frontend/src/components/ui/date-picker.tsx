import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input, type InputProps } from './input';
import { cn } from '@/lib/utils';

export interface DatePickerProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  label?: string;
  wrapperClassName?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('flex flex-col space-y-1.5 w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={inputId}
          type="date"
          leftIcon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
          className={cn(
            '[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

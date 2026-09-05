import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from './input';

export interface DatePickerProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  label?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        leftIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        className={className}
        {...props}
      />
    );
  }
);
DatePicker.displayName = 'DatePicker';

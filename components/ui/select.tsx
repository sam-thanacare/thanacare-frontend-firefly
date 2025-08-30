'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

export interface SelectProps<T = string> {
  value?: T;
  onValueChange?: (value: T) => void;
  children: React.ReactNode;
  className?: string;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps<T = string> {
  value: T;
  children: React.ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: unknown;
  onValueChange?: (value: unknown) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Select = <T = string,>({
  value,
  onValueChange,
  children,
  className,
}: SelectProps<T>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider
      value={{
        value: value as unknown,
        onValueChange: onValueChange as (value: unknown) => void,
        open,
        setOpen,
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className={cn('relative', className)}>{children}</div>
      </Popover>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const { setOpen } = React.useContext(SelectContext);

  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className={cn('w-full justify-between', className)}
        onClick={() => setOpen(true)}
      >
        {children}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
};

const SelectContent = ({ children, className }: SelectContentProps) => {
  return (
    <PopoverContent className={cn('w-full p-0', className)}>
      <div className="max-h-60 overflow-auto">{children}</div>
    </PopoverContent>
  );
};

const SelectItem = <T = string,>({
  value,
  children,
  className,
  ...props
}: SelectItemProps<T>) => {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
  } = React.useContext(SelectContext);

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start font-normal',
        selectedValue === value && 'bg-accent',
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={cn('block truncate', className)}>
      {value ? String(value) : placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };

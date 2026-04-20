'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-bg-elevated px-4 text-fg placeholder:text-fg-subtle transition-colors focus-visible:border-ketosis-good/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ketosis-good/10 disabled:opacity-40',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

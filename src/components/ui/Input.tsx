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
          'h-11 w-full rounded-xl border border-border bg-bg-elevated px-4 text-fg placeholder:text-fg-subtle focus-visible:border-ketosis-good/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ketosis-good/30 disabled:opacity-40',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

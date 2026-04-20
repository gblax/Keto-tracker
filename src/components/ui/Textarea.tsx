'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-fg placeholder:text-fg-subtle focus-visible:border-ketosis-good/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ketosis-good/30 disabled:opacity-40',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

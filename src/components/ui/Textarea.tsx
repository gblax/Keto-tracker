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
          'w-full resize-none rounded-2xl border border-border bg-bg-elevated px-4 py-3.5 text-[15px] leading-relaxed text-fg placeholder:text-fg-subtle transition-colors focus-visible:border-ketosis-good/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ketosis-good/10 disabled:opacity-40',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

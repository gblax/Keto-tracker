'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ketosis-good/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-b from-ketosis-good to-ketosis-goodDeep text-white shadow-[0_2px_8px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105 hover:shadow-[0_4px_14px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]',
        secondary:
          'bg-bg-elevated text-fg border border-border shadow-sm hover:bg-bg-card hover:border-border-strong',
        ghost: 'text-fg hover:bg-bg-card',
        destructive:
          'bg-ketosis-badSoft text-ketosis-bad hover:bg-ketosis-bad/15',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-7 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };

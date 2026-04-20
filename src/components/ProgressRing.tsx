'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { clamp } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  tone?: 'good' | 'warn' | 'bad';
  children?: React.ReactNode;
  className?: string;
}

const TONE_GRADIENTS: Record<NonNullable<ProgressRingProps['tone']>, [string, string]> = {
  good: ['#34d399', '#a3e635'],
  warn: ['#f59e0b', '#fbbf24'],
  bad: ['#ef4444', '#f87171'],
};

export function ProgressRing({
  value,
  max,
  size = 240,
  stroke = 16,
  tone = 'good',
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMotionValue(0);
  const target = clamp(value / Math.max(max, 1), 0, 1.25);

  useEffect(() => {
    const controls = animate(progress, target, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [target, progress]);

  const dashOffset = useTransform(progress, (p) => circumference * (1 - Math.min(p, 1)));
  const [from, to] = TONE_GRADIENTS[tone];
  const gradientId = `ring-${tone}`;

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a1a1a"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

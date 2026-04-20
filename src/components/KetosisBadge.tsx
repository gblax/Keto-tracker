'use client';

import { Zap, Flame, AlertTriangle, Clock } from 'lucide-react';
import { ketosisStateLabel, ketosisStateTone, type KetosisState } from '@/lib/ketosis';
import { cn } from '@/lib/utils';

const ICONS: Record<KetosisState, React.ComponentType<{ size?: number }>> = {
  in_ketosis: Zap,
  transitioning: Flame,
  out_of_ketosis: AlertTriangle,
  unknown: Clock,
};

const TONE_CLASSES = {
  good: 'bg-ketosis-goodSoft text-ketosis-goodDeep ring-ketosis-good/20',
  warn: 'bg-ketosis-warnSoft text-ketosis-warn ring-ketosis-warn/20',
  bad: 'bg-ketosis-badSoft text-ketosis-bad ring-ketosis-bad/20',
  muted: 'bg-bg-card text-fg-muted ring-border',
} as const;

export function KetosisBadge({
  state,
  size = 'md',
}: {
  state: KetosisState;
  size?: 'sm' | 'md';
}) {
  const Icon = ICONS[state];
  const tone = ketosisStateTone(state);
  const active = state === 'in_ketosis';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        size === 'md' ? 'px-3 py-1.5 text-[13px]' : 'px-2.5 py-1 text-xs',
        TONE_CLASSES[tone],
      )}
    >
      <Icon size={size === 'md' ? 14 : 12} />
      <span className={cn(active && 'animate-pulse-soft')}>
        {ketosisStateLabel(state)}
      </span>
    </div>
  );
}

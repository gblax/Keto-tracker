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
  good: 'bg-ketosis-good/10 text-ketosis-good border-ketosis-good/30',
  warn: 'bg-ketosis-warn/10 text-ketosis-warn border-ketosis-warn/30',
  bad: 'bg-ketosis-bad/10 text-ketosis-bad border-ketosis-bad/30',
  muted: 'bg-bg-elevated text-fg-muted border-border',
} as const;

export function KetosisBadge({ state }: { state: KetosisState }) {
  const Icon = ICONS[state];
  const tone = ketosisStateTone(state);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      <Icon size={13} />
      <span>{ketosisStateLabel(state)}</span>
    </div>
  );
}

import { Flame } from 'lucide-react';

export function StreakCounter({ days, threshold }: { days: number; threshold: number }) {
  if (days <= 0) return null;
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
      <Flame size={12} className="text-ketosis-warn" />
      <span className="tnum">
        {days}-day streak under {threshold}g
      </span>
    </div>
  );
}

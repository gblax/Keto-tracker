import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StreakCounter({
  days,
  threshold,
  className,
}: {
  days: number;
  threshold: number;
  className?: string;
}) {
  if (days <= 0) return null;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-fg-muted ring-1 ring-inset ring-border',
        className,
      )}
    >
      <Flame size={12} className="text-ketosis-warn" fill="currentColor" />
      <span>
        <span className="tnum text-fg">{days}</span> day streak · under {threshold}g
      </span>
    </div>
  );
}

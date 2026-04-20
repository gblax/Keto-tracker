'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { getDb } from '@/lib/db/schema';
import { rangeISO, shortDay, shortDate, todayISO } from '@/lib/date';
import { formatGrams } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

export default function HistoryPage() {
  const settings = useSettings();
  const [windowDays, setWindowDays] = useState<7 | 30>(7);
  const dates = rangeISO(windowDays);
  const today = todayISO();

  const rows = useLiveQuery(async () => {
    const db = getDb();
    return db.days.where('date').anyOf(dates).toArray();
  }, [windowDays]);

  const byDate = new Map((rows ?? []).map((d) => [d.date, d]));
  const days = dates.map((date) => {
    const r = byDate.get(date);
    return {
      date,
      netCarbsG: r?.netCarbsG ?? 0,
      entryCount: r?.entryCount ?? 0,
      isToday: date === today,
    };
  });

  const maxForScale = Math.max(
    settings.dailyLimitG * 1.5,
    ...days.map((d) => d.netCarbsG),
    1,
  );

  return (
    <div className="flex flex-col">
      <PageHeader title="History" subtitle="Daily net carbs over time" />

      <div className="mx-5 mb-4 inline-flex w-fit rounded-full border border-border bg-bg-elevated p-1 text-xs">
        {([7, 30] as const).map((n) => (
          <button
            key={n}
            onClick={() => setWindowDays(n)}
            className={cn(
              'rounded-full px-3 py-1 transition-colors',
              windowDays === n ? 'bg-bg-card text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {n} days
          </button>
        ))}
      </div>

      <ul className="space-y-1 px-5">
        {days.map((d) => {
          const over = d.netCarbsG > settings.ketosisThresholdG;
          const barWidth = Math.min((d.netCarbsG / maxForScale) * 100, 100);
          return (
            <li
              key={d.date}
              className="relative flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-bg-elevated/50"
            >
              <div className="w-14 shrink-0">
                <div className="text-xs font-medium text-fg-muted">
                  {d.isToday ? 'Today' : shortDay(d.date)}
                </div>
                <div className="text-[10px] text-fg-subtle">{shortDate(d.date)}</div>
              </div>

              <div className="relative flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      over
                        ? 'bg-gradient-to-r from-ketosis-bad to-ketosis-warn'
                        : 'bg-gradient-to-r from-ketosis-good to-ketosis-goodEnd',
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <div className="w-20 shrink-0 text-right">
                <span
                  className={cn(
                    'tnum font-display text-base',
                    over ? 'text-ketosis-bad' : 'text-fg',
                    d.netCarbsG === 0 && 'text-fg-subtle',
                  )}
                >
                  {formatGrams(d.netCarbsG)}
                  <span className="ml-0.5 text-xs text-fg-subtle">g</span>
                </span>
                {d.entryCount > 0 && (
                  <div className="text-[10px] text-fg-subtle">{d.entryCount} items</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

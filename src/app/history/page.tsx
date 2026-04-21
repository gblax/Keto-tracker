'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
      hasData: !!r,
    };
  });

  const stats = useMemo(() => {
    const completed = days.filter((d) => !d.isToday);
    const totalDays = completed.length;
    const underDays = completed.filter(
      (d) => d.hasData && d.netCarbsG <= settings.ketosisThresholdG,
    ).length;
    const avg = completed.length
      ? completed.reduce((s, d) => s + d.netCarbsG, 0) / completed.length
      : 0;
    return { totalDays, underDays, avg };
  }, [days, settings.ketosisThresholdG]);

  const maxForScale = Math.max(
    settings.dailyLimitG * 1.5,
    ...days.map((d) => d.netCarbsG),
    1,
  );

  return (
    <div className="flex flex-col">
      <PageHeader eyebrow="Trends" title="History" />

      <div className="mx-5 grid grid-cols-3 gap-2">
        <StatCard
          eyebrow="Days under"
          value={`${stats.underDays}/${stats.totalDays}`}
          tone="good"
        />
        <StatCard
          eyebrow="Avg net carbs"
          value={`${formatGrams(stats.avg, 0)}g`}
          tone={stats.avg <= settings.ketosisThresholdG ? 'good' : 'warn'}
        />
        <StatCard
          eyebrow="Window"
          value={`${windowDays}d`}
          tone="muted"
        />
      </div>

      <div className="mx-5 mt-6 inline-flex w-fit rounded-full border border-border bg-bg-elevated p-1 text-xs shadow-sm">
        {([7, 30] as const).map((n) => (
          <button
            key={n}
            onClick={() => setWindowDays(n)}
            className={cn(
              'rounded-full px-3.5 py-1.5 font-medium transition-all',
              windowDays === n
                ? 'bg-fg text-white shadow-sm'
                : 'text-fg-hint hover:text-fg',
            )}
          >
            {n} days
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-1 px-3">
        {days.map((d) => {
          const over = d.netCarbsG > settings.ketosisThresholdG;
          const barWidth = d.hasData
            ? Math.min((d.netCarbsG / maxForScale) * 100, 100)
            : 0;
          return (
            <li key={d.date}>
              <Link
                href={`/day/${d.date}`}
                className="group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-bg-elevated"
              >
                <div className="w-16 shrink-0">
                  <div
                    className={cn(
                      'text-[13px] font-semibold',
                      d.isToday ? 'text-ketosis-goodDeep' : 'text-fg',
                    )}
                  >
                    {d.isToday ? 'Today' : shortDay(d.date)}
                  </div>
                  <div className="text-[11px] text-fg-subtle">{shortDate(d.date)}</div>
                </div>

                <div className="relative flex-1">
                  <div className="h-[6px] overflow-hidden rounded-full bg-bg-card">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        over
                          ? 'bg-gradient-to-r from-ketosis-warn to-ketosis-bad'
                          : 'bg-gradient-to-r from-ketosis-good to-ketosis-goodEnd',
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div
                    className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong"
                    style={{
                      left: `${Math.min(
                        (settings.ketosisThresholdG / maxForScale) * 100,
                        100,
                      )}%`,
                    }}
                    aria-hidden
                  />
                </div>

                <div className="w-20 shrink-0 text-right">
                  {d.hasData ? (
                    <>
                      <span
                        className={cn(
                          'tnum font-display text-base font-semibold',
                          over ? 'text-ketosis-bad' : 'text-fg',
                        )}
                      >
                        {formatGrams(d.netCarbsG)}
                        <span className="ml-0.5 text-xs font-normal text-fg-subtle">g</span>
                      </span>
                      {d.entryCount > 0 && (
                        <div className="text-[10px] text-fg-subtle">
                          {d.entryCount} {d.entryCount === 1 ? 'item' : 'items'}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-fg-subtle">—</span>
                  )}
                </div>

                <ChevronRight
                  size={14}
                  className="ml-1 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatCard({
  eyebrow,
  value,
  tone,
}: {
  eyebrow: string;
  value: string;
  tone: 'good' | 'warn' | 'muted';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-ketosis-goodDeep'
      : tone === 'warn'
        ? 'text-ketosis-warn'
        : 'text-fg';
  return (
    <div className="rounded-2xl border border-border/70 bg-bg-elevated p-3.5 shadow-card">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {eyebrow}
      </p>
      <p className={cn('mt-1 font-display text-lg font-semibold tracking-tight tnum', toneClass)}>
        {value}
      </p>
    </div>
  );
}

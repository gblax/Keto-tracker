'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { EntryList } from '@/components/EntryList';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { useDayTotal, useEntriesForDate } from '@/hooks/useDayTotal';
import { isValidISO, longDate, todayISO } from '@/lib/date';
import { formatGrams } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (!isValidISO(date)) router.replace('/history');
  }, [date, router]);

  if (!isValidISO(date)) return null;

  return <DayView date={date} />;
}

function DayView({ date }: { date: string }) {
  const settings = useSettings();
  const dayTotal = useDayTotal(date);
  const entries = useEntriesForDate(date);

  const isToday = date === todayISO();
  const isFuture = date > todayISO();
  const remaining = settings.dailyLimitG - dayTotal.netCarbsG;
  const over = remaining < 0;
  const overThreshold = dayTotal.netCarbsG > settings.ketosisThresholdG;

  return (
    <div className="flex flex-col gap-6 px-5 pt-5">
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="-ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-fg-hint transition-colors hover:bg-bg-card hover:text-fg"
        >
          <ArrowLeft size={16} /> History
        </Link>
        <h1 className="font-display text-[15px] font-semibold tracking-tight">
          {isToday ? 'Today' : 'Day'}
        </h1>
        <span className="w-16" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-border/70 bg-bg-elevated p-6 shadow-card"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
          {isToday ? 'Today' : isFuture ? 'Upcoming' : 'Logged on'}
        </p>
        <h2 className="mt-1 font-display text-[22px] font-semibold tracking-tight text-fg">
          {longDate(date)}
        </h2>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <AnimatedNumber value={dayTotal.netCarbsG} />
            <p className="mt-1 text-xs font-medium text-fg-hint">
              of <span className="tnum">{settings.dailyLimitG}</span>g net carbs
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'tnum font-display text-base font-semibold',
                over ? 'text-ketosis-bad' : 'text-ketosis-goodDeep',
              )}
            >
              {over ? `+${formatGrams(-remaining)}` : formatGrams(remaining)}g
            </p>
            <p className="text-[11px] text-fg-subtle">
              {over ? 'over limit' : 'remaining'}
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-card">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              overThreshold
                ? 'bg-gradient-to-r from-ketosis-warn to-ketosis-bad'
                : 'bg-gradient-to-r from-ketosis-good to-ketosis-goodEnd',
            )}
            style={{
              width: `${Math.min((dayTotal.netCarbsG / Math.max(settings.dailyLimitG, 1)) * 100, 100)}%`,
            }}
          />
        </div>
      </motion.section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
              Entries
            </p>
            <h3 className="font-display text-[17px] font-semibold tracking-tight text-fg">
              {entries.length === 0
                ? 'Nothing logged yet'
                : `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}
            </h3>
          </div>
          {!isFuture && (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/add?date=${date}`}>
                <Plus size={14} /> Add
              </Link>
            </Button>
          )}
        </div>
        <EntryList
          entries={entries}
          dailyLimit={settings.dailyLimitG}
          emptyHint={
            isFuture
              ? 'You can’t log into the future.'
              : 'Tap Add to log a meal for this day.'
          }
        />
      </section>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => {
    if (v === 0) return '0';
    return v < 10 ? v.toFixed(1) : Math.round(v).toString();
  });

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <div className="flex items-baseline">
      <motion.span className="tnum font-display text-[44px] font-semibold leading-none tracking-tight text-fg">
        {rounded}
      </motion.span>
      <span className="ml-1 text-base font-medium text-fg-hint">g</span>
    </div>
  );
}

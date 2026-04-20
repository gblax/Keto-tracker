'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { ProgressRing } from '@/components/ProgressRing';
import { KetosisBadge } from '@/components/KetosisBadge';
import { StreakCounter } from '@/components/StreakCounter';
import { EntryList } from '@/components/EntryList';
import { Greeting } from '@/components/Greeting';
import { useSettings } from '@/hooks/useSettings';
import { useDayTotal, useEntriesForDate } from '@/hooks/useDayTotal';
import { useKetosis } from '@/hooks/useKetosis';
import { Button } from '@/components/ui/Button';
import { getDb } from '@/lib/db/schema';
import { formatGrams } from '@/lib/format';

export default function HomePage() {
  const router = useRouter();
  const settings = useSettings();
  const dayTotal = useDayTotal();
  const entries = useEntriesForDate();
  const ketosis = useKetosis();

  const settingsRow = useLiveQuery(() => getDb().settings.get('singleton'), []);

  useEffect(() => {
    if (settingsRow && settingsRow.onboarded === false) {
      router.replace('/onboarding');
    }
  }, [settingsRow, router]);

  const remaining = settings.dailyLimitG - dayTotal.netCarbsG;
  const over = remaining < 0;
  const tone: 'good' | 'warn' | 'bad' = over
    ? 'bad'
    : dayTotal.netCarbsG > settings.dailyLimitG * 0.75
      ? 'warn'
      : 'good';

  return (
    <div className="flex flex-col gap-6">
      <Greeting />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 rounded-[28px] border border-border/70 bg-bg-elevated p-6 shadow-card"
      >
        <div className="flex items-center justify-between">
          <KetosisBadge state={ketosis.state} />
          <StreakCounter
            days={ketosis.streakDays}
            threshold={settings.ketosisThresholdG}
          />
        </div>

        <div className="mt-4 flex justify-center">
          <ProgressRing
            value={dayTotal.netCarbsG}
            max={settings.dailyLimitG}
            tone={tone}
            size={256}
            stroke={16}
          >
            <div className="flex flex-col items-center">
              <AnimatedNumber value={dayTotal.netCarbsG} />
              <p className="mt-1.5 text-xs font-medium text-fg-hint">
                of <span className="tnum">{settings.dailyLimitG}</span>g net
              </p>
            </div>
          </ProgressRing>
        </div>

        <div className="mt-4 flex flex-col items-center gap-0.5">
          <p className="text-[13px] font-medium text-fg-muted">
            {over ? (
              <>
                <span className="tnum text-ketosis-bad">{formatGrams(-remaining)}g</span>{' '}
                over today&apos;s limit
              </>
            ) : (
              <>
                <span className="tnum text-ketosis-goodDeep">{formatGrams(remaining)}g</span>{' '}
                remaining today
              </>
            )}
          </p>
          <p className="text-xs text-fg-subtle">{ketosis.label}</p>
        </div>
      </motion.section>

      <section className="mx-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
              Today
            </p>
            <h2 className="font-display text-[19px] font-semibold tracking-tight text-fg">
              {entries.length === 0
                ? 'Log your first meal'
                : `${entries.length} ${entries.length === 1 ? 'item' : 'items'} logged`}
            </h2>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/add">
              <Plus size={14} /> Add
              <ArrowRight size={12} />
            </Link>
          </Button>
        </div>
        <EntryList entries={entries} dailyLimit={settings.dailyLimitG} />
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
    const controls = animate(mv, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <div className="flex items-baseline">
      <motion.span className="tnum font-display text-[64px] font-semibold leading-none tracking-tight text-fg">
        {rounded}
      </motion.span>
      <span className="ml-1 text-xl font-medium text-fg-hint">g</span>
    </div>
  );
}

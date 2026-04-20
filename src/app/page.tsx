'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ProgressRing } from '@/components/ProgressRing';
import { KetosisBadge } from '@/components/KetosisBadge';
import { StreakCounter } from '@/components/StreakCounter';
import { EntryList } from '@/components/EntryList';
import { useSettings } from '@/hooks/useSettings';
import { useDayTotal, useEntriesForDate } from '@/hooks/useDayTotal';
import { useKetosis } from '@/hooks/useKetosis';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  const settings = useSettings();
  const dayTotal = useDayTotal();
  const entries = useEntriesForDate();
  const ketosis = useKetosis();

  useEffect(() => {
    if (settings && !settings.onboarded) {
      router.replace('/onboarding');
    }
  }, [settings, router]);

  const tone: 'good' | 'warn' | 'bad' =
    dayTotal.netCarbsG > settings.dailyLimitG
      ? 'bad'
      : dayTotal.netCarbsG > settings.dailyLimitG * 0.75
        ? 'warn'
        : 'good';

  return (
    <div className="flex flex-col">
      <div className="px-5 pt-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-fg-subtle">Today</p>
        <div className="mt-2 flex items-center justify-center">
          <KetosisBadge state={ketosis.state} />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <ProgressRing
          value={dayTotal.netCarbsG}
          max={settings.dailyLimitG}
          tone={tone}
          size={260}
        >
          <div className="flex flex-col items-center">
            <AnimatedNumber value={dayTotal.netCarbsG} />
            <p className="mt-1 text-xs text-fg-muted">
              <span className="tnum">{settings.dailyLimitG}</span>g net limit
            </p>
          </div>
        </ProgressRing>
      </div>

      <div className="mt-2 flex flex-col items-center gap-1 px-5 text-center">
        <StreakCounter days={ketosis.streakDays} threshold={settings.ketosisThresholdG} />
        <p className="text-xs text-fg-subtle">{ketosis.label}</p>
      </div>

      <section className="mt-10 space-y-3 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Today&apos;s entries</h2>
          <Button asChild size="sm" variant="secondary">
            <Link href="/add">
              <Plus size={14} /> Add
            </Link>
          </Button>
        </div>
        <EntryList entries={entries} />
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
    const controls = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <div className="flex items-baseline">
      <motion.span className="tnum font-display text-6xl font-semibold tracking-tight text-fg">
        {rounded}
      </motion.span>
      <span className="ml-1 text-xl text-fg-muted">g</span>
    </div>
  );
}

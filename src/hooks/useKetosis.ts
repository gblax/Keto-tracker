'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/lib/db/schema';
import { rangeISO, todayISO } from '@/lib/date';
import {
  computeKetosis,
  type KetosisResult,
  type DayTotalInput,
} from '@/lib/ketosis';
import { useSettings } from './useSettings';

export function useKetosis(windowDays = 10): KetosisResult {
  const settings = useSettings();
  const dates = rangeISO(windowDays);
  const today = todayISO();

  const rows = useLiveQuery(async () => {
    const db = getDb();
    return db.days.where('date').anyOf(dates).toArray();
  }, [dates.join(',')]);

  const byDate = new Map((rows ?? []).map((d) => [d.date, d]));
  const inputs: DayTotalInput[] = dates.map((date) => {
    const r = byDate.get(date);
    return {
      date,
      netCarbs: r?.netCarbsG ?? 0,
      complete: date < today,
    };
  });

  return computeKetosis(inputs, {
    threshold: settings.ketosisThresholdG,
    streakForKetosis: settings.streakForKetosis,
    graceDays: settings.graceDays,
  });
}

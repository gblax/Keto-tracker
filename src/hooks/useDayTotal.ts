'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb, type DayTotal, type FoodEntry } from '@/lib/db/schema';
import { todayISO } from '@/lib/date';

export function useDayTotal(date: string = todayISO()): DayTotal {
  const row = useLiveQuery(() => getDb().days.get(date), [date]);
  return (
    row ?? {
      date,
      netCarbsG: 0,
      entryCount: 0,
      complete: date < todayISO(),
      updatedAt: 0,
    }
  );
}

export function useEntriesForDate(date: string = todayISO()): FoodEntry[] {
  const rows = useLiveQuery(
    () => getDb().entries.where('date').equals(date).sortBy('createdAt'),
    [date],
  );
  return rows ?? [];
}

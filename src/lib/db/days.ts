import { getDb, type DayTotal } from './schema';
import { rangeISO, todayISO } from '@/lib/date';

export async function getDayTotal(date: string): Promise<DayTotal | undefined> {
  const db = getDb();
  return db.days.get(date);
}

export async function getRecentDays(days: number): Promise<DayTotal[]> {
  const db = getDb();
  const today = todayISO();
  const wantedDates = rangeISO(days);
  const existing = await db.days.where('date').anyOf(wantedDates).toArray();
  const byDate = new Map(existing.map((d) => [d.date, d]));
  return wantedDates.map(
    (date): DayTotal =>
      byDate.get(date) ?? {
        date,
        netCarbsG: 0,
        entryCount: 0,
        complete: date < today,
        updatedAt: 0,
      },
  );
}

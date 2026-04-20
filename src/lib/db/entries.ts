import { getDb, type FoodEntry } from './schema';
import { todayISO } from '@/lib/date';

export interface NewEntry {
  name: string;
  quantityText?: string;
  gramsEstimate: number;
  netCarbsG: number;
  confidence: number;
  source: 'ai' | 'manual' | 'edited';
  rawInput?: string;
}

export async function addEntries(items: NewEntry[], date: string = todayISO()): Promise<void> {
  if (items.length === 0) return;
  const db = getDb();
  const batchId = crypto.randomUUID();
  const now = Date.now();
  await db.transaction('rw', db.entries, db.days, async () => {
    const rows: FoodEntry[] = items.map((it) => ({
      ...it,
      date,
      createdAt: now,
      batchId,
    }));
    await db.entries.bulkAdd(rows);
    await recomputeDayTotal(date);
  });
}

export async function deleteEntry(id: number): Promise<void> {
  const db = getDb();
  const entry = await db.entries.get(id);
  if (!entry) return;
  await db.transaction('rw', db.entries, db.days, async () => {
    await db.entries.delete(id);
    await recomputeDayTotal(entry.date);
  });
}

export async function updateEntry(id: number, patch: Partial<FoodEntry>): Promise<void> {
  const db = getDb();
  const entry = await db.entries.get(id);
  if (!entry) return;
  await db.transaction('rw', db.entries, db.days, async () => {
    await db.entries.update(id, { ...patch, source: 'edited' });
    await recomputeDayTotal(entry.date);
  });
}

export async function listEntriesForDate(date: string): Promise<FoodEntry[]> {
  const db = getDb();
  return db.entries.where('date').equals(date).sortBy('createdAt');
}

export async function recomputeDayTotal(date: string): Promise<void> {
  const db = getDb();
  const rows = await db.entries.where('date').equals(date).toArray();
  const netCarbsG = rows.reduce((sum, r) => sum + (Number(r.netCarbsG) || 0), 0);
  const today = todayISO();
  await db.days.put({
    date,
    netCarbsG,
    entryCount: rows.length,
    complete: date < today,
    updatedAt: Date.now(),
  });
}

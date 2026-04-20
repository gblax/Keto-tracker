'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb, DEFAULT_SETTINGS, type Settings } from '@/lib/db/schema';

export function useSettings(): Settings {
  const settings = useLiveQuery(async () => {
    const db = getDb();
    const s = await db.settings.get('singleton');
    if (s) return s;
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }, []);
  return settings ?? DEFAULT_SETTINGS;
}

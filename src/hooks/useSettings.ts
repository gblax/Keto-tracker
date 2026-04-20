'use client';

import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb, DEFAULT_SETTINGS, type Settings } from '@/lib/db/schema';

export function useSettings(): Settings {
  const seeded = useRef(false);

  // Seed defaults on first mount — outside useLiveQuery (which is read-only)
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const db = getDb();
    db.settings.get('singleton').then((s) => {
      if (!s) db.settings.put(DEFAULT_SETTINGS);
    });
  }, []);

  const settings = useLiveQuery(() => getDb().settings.get('singleton'), []);
  return settings ?? DEFAULT_SETTINGS;
}

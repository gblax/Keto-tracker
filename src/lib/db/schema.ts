import Dexie, { type Table } from 'dexie';
import type { KetosisState } from '@/lib/ketosis';

export interface FoodEntry {
  id?: number;
  date: string;
  createdAt: number;
  name: string;
  quantityText?: string;
  gramsEstimate: number;
  netCarbsG: number;
  confidence: number;
  source: 'ai' | 'manual' | 'edited';
  rawInput?: string;
  batchId?: string;
}

export interface DayTotal {
  date: string;
  netCarbsG: number;
  entryCount: number;
  ketosisState?: KetosisState;
  complete: boolean;
  updatedAt: number;
}

export interface Settings {
  id: 'singleton';
  dailyLimitG: number;
  ketosisThresholdG: number;
  streakForKetosis: number;
  graceDays: number;
  anthropicApiKey?: string;
  theme: 'dark' | 'light' | 'system';
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  dailyLimitG: 20,
  ketosisThresholdG: 20,
  streakForKetosis: 3,
  graceDays: 1,
  theme: 'dark',
  onboarded: false,
};

export class KetoDB extends Dexie {
  entries!: Table<FoodEntry, number>;
  days!: Table<DayTotal, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('keto-tracker');
    this.version(1).stores({
      entries: '++id, date, createdAt, batchId',
      days: 'date, complete',
      settings: 'id',
    });
  }
}

let _db: KetoDB | null = null;

export function getDb(): KetoDB {
  if (typeof window === 'undefined') {
    throw new Error('Dexie DB only accessible in the browser');
  }
  if (!_db) _db = new KetoDB();
  return _db;
}

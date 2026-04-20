'use client';

import { Trash2, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FoodEntry } from '@/lib/db/schema';
import { deleteEntry } from '@/lib/db/entries';
import { formatGrams } from '@/lib/format';
import { cn } from '@/lib/utils';

export function EntryList({
  entries,
  dailyLimit,
}: {
  entries: FoodEntry[];
  dailyLimit: number;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-bg-elevated/40 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-card text-fg-subtle">
          <Utensils size={20} strokeWidth={1.75} />
        </div>
        <p className="mt-3 text-sm font-medium text-fg">Nothing logged yet</p>
        <p className="mt-1 text-xs text-fg-hint">
          Tap the green <span className="font-semibold text-fg">+</span> to add a meal.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((e) => {
          const pct = Math.min((e.netCarbsG / Math.max(dailyLimit, 1)) * 100, 100);
          const overHalf = pct > 50;
          return (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-bg-elevated shadow-card"
            >
              <div className="flex items-center gap-3 p-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                    overHalf
                      ? 'bg-ketosis-warnSoft text-ketosis-warn ring-ketosis-warn/20'
                      : 'bg-ketosis-goodSoft text-ketosis-goodDeep ring-ketosis-good/20',
                  )}
                >
                  <span className="tnum text-xs font-semibold">
                    {formatGrams(e.netCarbsG, 0)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium text-fg">{e.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-hint">
                    {e.quantityText && <span className="truncate">{e.quantityText}</span>}
                    {e.quantityText && <span>·</span>}
                    <span
                      className={cn(e.confidence < 0.5 && 'text-ketosis-warn')}
                      title="AI confidence"
                    >
                      {Math.round(e.confidence * 100)}% conf
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline whitespace-nowrap">
                  <span className="tnum font-display text-lg font-semibold text-fg">
                    {formatGrams(e.netCarbsG)}
                  </span>
                  <span className="ml-0.5 text-xs text-fg-subtle">g</span>
                </div>

                <button
                  aria-label={`Delete ${e.name}`}
                  onClick={() => e.id != null && deleteEntry(e.id)}
                  className="ml-1 rounded-full p-2 text-fg-subtle opacity-0 transition-all group-hover:opacity-100 hover:bg-ketosis-badSoft hover:text-ketosis-bad"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="h-0.5 w-full bg-bg-card">
                <div
                  className={cn(
                    'h-full rounded-r-full transition-all',
                    overHalf
                      ? 'bg-gradient-to-r from-ketosis-warn to-ketosis-bad'
                      : 'bg-gradient-to-r from-ketosis-good to-ketosis-goodEnd',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

'use client';

import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FoodEntry } from '@/lib/db/schema';
import { deleteEntry } from '@/lib/db/entries';
import { formatGrams } from '@/lib/format';
import { cn } from '@/lib/utils';

export function EntryList({ entries }: { entries: FoodEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-fg-muted">
        No entries yet today. Tap the <span className="font-semibold text-fg">+</span> tab to log
        something.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((e) => (
          <motion.li
            key={e.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between rounded-2xl border border-border bg-bg-elevated p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-fg">{e.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
                {e.quantityText && <span>{e.quantityText}</span>}
                {e.quantityText && <span>·</span>}
                <span className={cn(e.confidence < 0.5 && 'text-ketosis-warn')}>
                  {Math.round(e.confidence * 100)}% conf
                </span>
              </div>
            </div>
            <div className="ml-3 text-right">
              <div className="tnum font-display text-lg text-fg">
                {formatGrams(e.netCarbsG)}
                <span className="ml-0.5 text-xs text-fg-subtle">g</span>
              </div>
            </div>
            <button
              aria-label={`Delete ${e.name}`}
              onClick={() => e.id != null && deleteEntry(e.id)}
              className="ml-3 rounded-full p-2 text-fg-subtle transition-colors hover:bg-ketosis-bad/10 hover:text-ketosis-bad"
            >
              <Trash2 size={16} />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

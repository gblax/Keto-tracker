'use client';

import { useState } from 'react';
import { Trash2, Utensils, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FoodEntry } from '@/lib/db/schema';
import { deleteEntry, updateEntry } from '@/lib/db/entries';
import { formatGrams } from '@/lib/format';
import { cn } from '@/lib/utils';

export function EntryList({
  entries,
  dailyLimit,
  emptyHint,
}: {
  entries: FoodEntry[];
  dailyLimit: number;
  emptyHint?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-bg-elevated/40 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-card text-fg-subtle">
          <Utensils size={20} strokeWidth={1.75} />
        </div>
        <p className="mt-3 text-sm font-medium text-fg">Nothing logged</p>
        <p className="mt-1 text-xs text-fg-hint">
          {emptyHint ?? (
            <>
              Tap the green <span className="font-semibold text-fg">+</span> to add a meal.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((e) => (
          <EntryRow key={e.id} entry={e} dailyLimit={dailyLimit} />
        ))}
      </AnimatePresence>
    </ul>
  );
}

function EntryRow({ entry, dailyLimit }: { entry: FoodEntry; dailyLimit: number }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entry.name);
  const [netCarbs, setNetCarbs] = useState(String(entry.netCarbsG));
  const [grams, setGrams] = useState(String(entry.gramsEstimate));
  const [quantity, setQuantity] = useState(entry.quantityText ?? '');
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setName(entry.name);
    setNetCarbs(String(entry.netCarbsG));
    setGrams(String(entry.gramsEstimate));
    setQuantity(entry.quantityText ?? '');
    setEditing(true);
  }

  async function save() {
    if (entry.id == null) return;
    setSaving(true);
    const nc = parseFloat(netCarbs);
    const g = parseFloat(grams);
    await updateEntry(entry.id, {
      name: name.trim() || entry.name,
      netCarbsG: Number.isFinite(nc) && nc >= 0 ? nc : entry.netCarbsG,
      gramsEstimate: Number.isFinite(g) && g >= 0 ? g : entry.gramsEstimate,
      quantityText: quantity.trim() || undefined,
    });
    setSaving(false);
    setEditing(false);
  }

  const pct = Math.min((entry.netCarbsG / Math.max(dailyLimit, 1)) * 100, 100);
  const overHalf = pct > 50;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-bg-elevated shadow-card transition-colors',
        editing
          ? 'border-ketosis-good/40 ring-2 ring-ketosis-good/15'
          : 'border-border/70',
      )}
    >
      {!editing ? (
        <button
          type="button"
          onClick={startEdit}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-bg-card/40"
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              overHalf
                ? 'bg-ketosis-warnSoft text-ketosis-warn ring-ketosis-warn/20'
                : 'bg-ketosis-goodSoft text-ketosis-goodDeep ring-ketosis-good/20',
            )}
          >
            <span className="tnum text-xs font-semibold">
              {formatGrams(entry.netCarbsG, 0)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-medium text-fg">{entry.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-hint">
              {entry.quantityText && <span className="truncate">{entry.quantityText}</span>}
              {entry.quantityText && <span>·</span>}
              <span
                className={cn(entry.confidence < 0.5 && 'text-ketosis-warn')}
                title="AI confidence"
              >
                {Math.round(entry.confidence * 100)}% conf
              </span>
            </div>
          </div>

          <div className="flex items-baseline whitespace-nowrap">
            <span className="tnum font-display text-lg font-semibold text-fg">
              {formatGrams(entry.netCarbsG)}
            </span>
            <span className="ml-0.5 text-xs text-fg-subtle">g</span>
          </div>

          <span className="ml-1 rounded-full p-2 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100">
            <Pencil size={14} />
          </span>
        </button>
      ) : (
        <div className="space-y-3 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-[15px] font-medium text-fg focus:outline-none"
            placeholder="Food name"
            autoFocus
          />
          <div className="flex flex-wrap items-end gap-2">
            <NumField
              label="net carbs"
              value={netCarbs}
              unit="g"
              onChange={setNetCarbs}
              emphasized
            />
            <NumField label="grams" value={grams} unit="g" onChange={setGrams} />
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="quantity"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-bg-card px-3 text-xs text-fg placeholder:text-fg-subtle focus:border-ketosis-good/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => entry.id != null && deleteEntry(entry.id)}
              className="inline-flex items-center gap-1 rounded-full bg-ketosis-badSoft px-3 py-1.5 text-xs font-medium text-ketosis-bad transition-colors hover:bg-ketosis-bad/15"
            >
              <Trash2 size={13} /> Delete
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded-full bg-bg-card px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-bg-card/70 hover:text-fg"
              >
                <X size={13} /> Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-ketosis-good to-ketosis-goodDeep px-3 py-1.5 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(16,185,129,0.25)] transition-all hover:brightness-105 disabled:opacity-60"
              >
                <Check size={13} /> {saving ? 'Saving' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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
}

function NumField({
  label,
  value,
  unit,
  onChange,
  emphasized,
}: {
  label: string;
  value: string;
  unit: string;
  onChange: (v: string) => void;
  emphasized?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.1em] text-fg-subtle">{label}</span>
      <div
        className={cn(
          'flex h-10 items-baseline rounded-lg border px-2.5',
          emphasized
            ? 'border-ketosis-good/40 bg-ketosis-goodSoft/40'
            : 'border-border bg-bg-card',
        )}
      >
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'tnum w-12 bg-transparent text-right text-sm focus:outline-none',
            emphasized ? 'font-semibold text-ketosis-goodDeep' : 'text-fg',
          )}
        />
        <span className="ml-0.5 text-[11px] text-fg-subtle">{unit}</span>
      </div>
    </label>
  );
}

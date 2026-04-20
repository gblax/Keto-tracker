'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ParsedFoodItem } from '@/lib/ai/parseFoods';
import { cn } from '@/lib/utils';

export interface EditableItem extends ParsedFoodItem {
  _key: string;
}

interface Props {
  items: EditableItem[];
  onChange: (items: EditableItem[]) => void;
}

export function EntryEditor({ items, onChange }: Props) {
  const update = (key: string, patch: Partial<EditableItem>) => {
    onChange(items.map((it) => (it._key === key ? { ...it, ...patch } : it)));
  };
  const remove = (key: string) => onChange(items.filter((it) => it._key !== key));

  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it._key}
          className="space-y-3 rounded-2xl border border-border/70 bg-bg-elevated p-4 shadow-card"
        >
          <div className="flex items-start justify-between gap-2">
            <input
              value={it.name}
              onChange={(e) => update(it._key, { name: e.target.value })}
              className="flex-1 bg-transparent text-[15px] font-medium text-fg focus:outline-none"
            />
            <ConfidencePill confidence={it.confidence} />
            <button
              aria-label="Remove item"
              onClick={() => remove(it._key)}
              className="rounded-full p-1.5 text-fg-subtle transition-colors hover:bg-ketosis-badSoft hover:text-ketosis-bad"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex items-end gap-2">
            <NumField
              label="net carbs"
              value={it.net_carbs_g}
              unit="g"
              onChange={(v) => update(it._key, { net_carbs_g: v })}
              emphasized
            />
            <NumField
              label="grams"
              value={it.grams_estimate}
              unit="g"
              onChange={(v) => update(it._key, { grams_estimate: v })}
            />
            <Input
              value={it.quantity_text ?? ''}
              placeholder="quantity"
              onChange={(e) => update(it._key, { quantity_text: e.target.value })}
              className="h-10 flex-1 text-xs"
            />
          </div>
        </li>
      ))}
    </ul>
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
  value: number;
  unit: string;
  onChange: (n: number) => void;
  emphasized?: boolean;
}) {
  const [raw, setRaw] = useState(String(value));
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
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            const n = parseFloat(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
          onBlur={() => setRaw(String(value))}
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

function ConfidencePill({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const tone =
    confidence >= 0.75 ? 'good' : confidence >= 0.5 ? 'muted' : 'warn';
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium',
        tone === 'good' && 'bg-ketosis-goodSoft text-ketosis-goodDeep',
        tone === 'muted' && 'bg-bg-card text-fg-muted',
        tone === 'warn' && 'bg-ketosis-warnSoft text-ketosis-warn',
      )}
    >
      {pct}%
    </span>
  );
}

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
          className="space-y-3 rounded-2xl border border-border bg-bg-elevated p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <input
              value={it.name}
              onChange={(e) => update(it._key, { name: e.target.value })}
              className="flex-1 bg-transparent text-base font-medium text-fg focus:outline-none"
            />
            <ConfidencePill confidence={it.confidence} />
            <button
              aria-label="Remove item"
              onClick={() => remove(it._key)}
              className="rounded-full p-1.5 text-fg-subtle transition-colors hover:bg-ketosis-bad/10 hover:text-ketosis-bad"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <NumField
              label="grams"
              value={it.grams_estimate}
              onChange={(v) => update(it._key, { grams_estimate: v })}
            />
            <NumField
              label="net carbs"
              value={it.net_carbs_g}
              onChange={(v) => update(it._key, { net_carbs_g: v })}
            />
            <Input
              value={it.quantity_text ?? ''}
              placeholder="quantity"
              onChange={(e) => update(it._key, { quantity_text: e.target.value })}
              className="flex-1 text-xs"
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
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const [raw, setRaw] = useState(String(value));
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</span>
      <input
        inputMode="decimal"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          const n = parseFloat(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => setRaw(String(value))}
        className="tnum h-9 w-20 rounded-lg border border-border bg-bg px-2 text-right text-sm focus:outline-none focus-visible:border-ketosis-good/50"
      />
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
        tone === 'good' && 'bg-ketosis-good/10 text-ketosis-good',
        tone === 'muted' && 'bg-bg-card text-fg-muted',
        tone === 'warn' && 'bg-ketosis-warn/10 text-ketosis-warn',
      )}
    >
      {pct}%
    </span>
  );
}

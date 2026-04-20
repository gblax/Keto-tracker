'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { EntryEditor, type EditableItem } from '@/components/EntryEditor';
import { parseFoods, MissingApiKeyError } from '@/lib/ai/parseFoods';
import { addEntries } from '@/lib/db/entries';
import { useSettings } from '@/hooks/useSettings';
import { formatGrams } from '@/lib/format';

const EXAMPLES = [
  'two eggs, bacon, and coffee with cream',
  '1 cup rice and grilled chicken breast',
  'handful of almonds and an apple',
];

export default function AddPage() {
  const router = useRouter();
  const settings = useSettings();
  const [text, setText] = useState('');
  const [items, setItems] = useState<EditableItem[] | null>(null);
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasKey = !!settings.anthropicApiKey;

  async function handleParse() {
    setError(null);
    if (!text.trim()) return;
    if (!hasKey) {
      setError('No API key configured. Add one in Settings first.');
      return;
    }
    setLoading(true);
    try {
      const res = await parseFoods(text, settings.anthropicApiKey!);
      if (res.items.length === 0) {
        setError('Could not parse any foods from that input — try rewording.');
      } else {
        setRawInput(text);
        setItems(
          res.items.map((it) => ({
            ...it,
            _key: crypto.randomUUID(),
          })),
        );
      }
    } catch (e) {
      if (e instanceof MissingApiKeyError) {
        setError(e.message);
      } else {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(
          msg.includes('offline') || msg.includes('NetworkError')
            ? 'Offline — AI parsing unavailable.'
            : `AI parse failed: ${msg}`,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!items || items.length === 0) return;
    await addEntries(
      items.map((it) => ({
        name: it.name,
        quantityText: it.quantity_text,
        gramsEstimate: it.grams_estimate,
        netCarbsG: it.net_carbs_g,
        confidence: it.confidence,
        source: 'ai',
        rawInput,
      })),
    );
    router.push('/');
  }

  const total = items?.reduce((s, it) => s + (Number(it.net_carbs_g) || 0), 0) ?? 0;
  const overLimit = total > settings.dailyLimitG;

  return (
    <div className="flex flex-col px-5 pt-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="-ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-fg-hint transition-colors hover:bg-bg-card hover:text-fg"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="font-display text-[15px] font-semibold tracking-tight">
          {items ? 'Review' : 'Log food'}
        </h1>
        <span className="w-16" />
      </div>

      <AnimatePresence mode="wait">
        {!items ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
                In your own words
              </p>
              <h2 className="font-display text-[24px] font-semibold leading-tight tracking-tight">
                What did you eat?
              </h2>
            </div>

            <Textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. two eggs, avocado toast, and a banana"
              autoFocus
              className="text-[17px]"
            />

            <div>
              <p className="mb-2 text-xs text-fg-hint">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setText(ex)}
                    className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-xs text-fg-muted shadow-sm transition-all hover:border-ketosis-good/40 hover:bg-ketosis-goodSoft/50 hover:text-ketosis-goodDeep"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-ketosis-bad/20 bg-ketosis-badSoft px-4 py-3 text-sm text-ketosis-bad">
                {error}
                {!hasKey && (
                  <Link href="/settings" className="ml-1 underline">
                    Open Settings
                  </Link>
                )}
              </div>
            )}

            <Button
              onClick={handleParse}
              disabled={loading || !text.trim() || !hasKey}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Thinking…
                </>
              ) : (
                <>
                  <Sparkles size={17} /> Parse with AI
                </>
              )}
            </Button>
            {!hasKey && (
              <p className="text-center text-xs text-fg-hint">
                Paste your Anthropic API key in{' '}
                <Link href="/settings" className="font-medium text-fg underline">
                  Settings
                </Link>{' '}
                to enable AI parsing.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            <div className="rounded-3xl border border-border/70 bg-bg-elevated p-5 shadow-card">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
                Batch total
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="tnum font-display text-4xl font-semibold tracking-tight text-fg">
                  {formatGrams(total)}
                </span>
                <span className="text-sm text-fg-hint">g net carbs</span>
                {overLimit && (
                  <span className="ml-auto rounded-full bg-ketosis-badSoft px-2.5 py-1 text-[11px] font-medium text-ketosis-bad">
                    exceeds daily limit
                  </span>
                )}
              </div>
              <p className="mt-2 truncate text-xs italic text-fg-hint">
                &ldquo;{rawInput}&rdquo;
              </p>
            </div>

            <EntryEditor items={items} onChange={setItems} />

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setItems(null);
                  setRawInput('');
                }}
              >
                Start over
              </Button>
              <Button
                size="lg"
                className="flex-[1.4]"
                onClick={handleSave}
                disabled={items.length === 0}
              >
                Save {items.length} {items.length === 1 ? 'item' : 'items'}
                <ChevronRight size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

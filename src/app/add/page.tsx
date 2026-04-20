'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { EntryEditor, type EditableItem } from '@/components/EntryEditor';
import { parseFoods, MissingApiKeyError } from '@/lib/ai/parseFoods';
import { addEntries } from '@/lib/db/entries';
import { useSettings } from '@/hooks/useSettings';
import { formatGrams } from '@/lib/format';

const EXAMPLES = [
  'two eggs and a slice of bacon',
  '1 cup of rice and chicken breast',
  'handful of almonds and a block of cheese',
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
        setError(msg.includes('offline') ? 'Offline — AI parsing unavailable.' : `AI parse failed: ${msg}`);
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

  return (
    <div className="flex flex-col px-5 pt-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="font-display text-lg font-semibold">Log food</h1>
        <span className="w-12" />
      </div>

      <AnimatePresence mode="wait">
        {!items ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 space-y-4"
          >
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wider text-fg-subtle">
                What did you eat?
              </span>
              <Textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. two eggs, avocado toast, and a banana"
                autoFocus
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setText(ex)}
                  className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-fg-muted transition-colors hover:bg-bg-card hover:text-fg"
                >
                  {ex}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl border border-ketosis-bad/30 bg-ketosis-bad/10 p-3 text-sm text-ketosis-bad">
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
                  <Sparkles size={18} /> Parse with AI
                </>
              )}
            </Button>
            {!hasKey && (
              <p className="text-center text-xs text-fg-subtle">
                Paste your Anthropic API key in{' '}
                <Link href="/settings" className="underline">
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
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-elevated p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-fg-subtle">Batch total</p>
                <p className="tnum font-display text-2xl text-fg">
                  {formatGrams(total)}
                  <span className="ml-1 text-sm text-fg-muted">g net carbs</span>
                </p>
              </div>
              <p className="max-w-[50%] text-right text-xs italic text-fg-subtle line-clamp-2">
                &ldquo;{rawInput}&rdquo;
              </p>
            </div>

            <EntryEditor items={items} onChange={setItems} />

            <div className="flex gap-2">
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
                className="flex-1"
                onClick={handleSave}
                disabled={items.length === 0}
              >
                Save {items.length} {items.length === 1 ? 'item' : 'items'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateSettings } from '@/lib/db/settings';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [limit, setLimit] = useState(20);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    await updateSettings({
      dailyLimitG: limit,
      ketosisThresholdG: limit,
      anthropicApiKey: apiKey.trim() || undefined,
      onboarded: true,
    });
    router.replace('/');
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {step === 1 && (
          <>
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-ketosis-good to-ketosis-goodEnd text-black shadow-xl shadow-ketosis-good/20">
                <Zap size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Welcome to Keto Tracker
              </h1>
              <p className="mt-2 text-sm text-fg-muted">
                Log what you eat in plain English. We&apos;ll handle the net carbs and tell you
                when you&apos;re in ketosis.
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep(2)}>
              Get started <ArrowRight size={16} />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Your daily net-carb limit
            </h2>
            <p className="text-sm text-fg-muted">
              Most keto plans stay under 20g of net carbs per day. You can change this later.
            </p>
            <div className="flex items-center gap-3">
              <input
                inputMode="numeric"
                value={String(limit)}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n > 0 && n <= 200) setLimit(n);
                }}
                className="tnum h-16 w-28 rounded-2xl border border-border bg-bg-elevated text-center font-display text-3xl focus:outline-none focus-visible:border-ketosis-good/50"
              />
              <span className="text-sm text-fg-muted">g net carbs / day</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setStep(3)}>
                Continue <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated">
                <Sparkles size={28} className="text-ketosis-good" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Add your Anthropic API key
              </h2>
              <p className="mt-2 text-sm text-fg-muted">
                Needed to parse natural-language food entries. Your key stays on this device;
                it&apos;s only sent to api.anthropic.com. You can skip this and add it later.
              </p>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-ketosis-good underline"
              >
                Get a key <ExternalLink size={11} />
              </a>
            </div>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={finish}
                disabled={saving}
              >
                {apiKey.trim() ? 'Finish' : 'Skip for now'}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

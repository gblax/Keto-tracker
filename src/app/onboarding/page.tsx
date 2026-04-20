'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, Sparkles, Target } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateSettings } from '@/lib/db/settings';
import { cn } from '@/lib/utils';

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
    <div className="flex min-h-[100vh] flex-col">
      <div className="flex items-center justify-between px-6 pt-8">
        <StepIndicator step={step} total={3} />
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as 1 | 2)}
            className="text-sm text-fg-hint transition-colors hover:text-fg"
          >
            Back
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {step === 1 && (
              <>
                <HeroMark />
                <div className="space-y-3 text-center">
                  <h1 className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight">
                    Track carbs,
                    <br />
                    <span className="text-gradient-good">stay in ketosis.</span>
                  </h1>
                  <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-fg-muted">
                    Log what you eat in plain English. Claude estimates the net carbs so you
                    don&apos;t have to look anything up.
                  </p>
                </div>
                <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                  Get started <ArrowRight size={16} />
                </Button>
                <p className="text-center text-xs text-fg-subtle">
                  Fully private. Everything stays on this device.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <StepHeader
                  icon={Target}
                  eyebrow="Step 2 of 3"
                  title="Your daily limit"
                  subtitle="Most keto plans stay under 20g of net carbs per day. You can change this anytime."
                />
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="flex items-baseline gap-2">
                    <input
                      inputMode="numeric"
                      value={String(limit)}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (Number.isFinite(n) && n > 0 && n <= 200) setLimit(n);
                      }}
                      className="tnum h-20 w-28 rounded-3xl border border-border bg-bg-elevated text-center font-display text-5xl font-semibold tracking-tight shadow-card focus:border-ketosis-good/50 focus:outline-none focus:ring-4 focus:ring-ketosis-good/10"
                    />
                    <span className="text-sm text-fg-muted">g / day</span>
                  </div>
                  <div className="flex gap-2">
                    {[20, 30, 50].map((v) => (
                      <button
                        key={v}
                        onClick={() => setLimit(v)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          limit === v
                            ? 'border-ketosis-good bg-ketosis-goodSoft text-ketosis-goodDeep'
                            : 'border-border bg-bg-elevated text-fg-hint hover:text-fg',
                        )}
                      >
                        {v}g
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={() => setStep(3)}>
                  Continue <ArrowRight size={16} />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <StepHeader
                  icon={Sparkles}
                  eyebrow="Step 3 of 3"
                  title="AI parsing"
                  subtitle="Add your Anthropic API key to parse natural-language entries. Your key stays on this device."
                />
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-…"
                    autoComplete="off"
                    className="font-mono"
                    autoFocus
                  />
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-ketosis-goodDeep underline underline-offset-2"
                  >
                    Get a key <ExternalLink size={11} />
                  </a>
                </div>
                <div className="space-y-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={finish}
                    disabled={saving}
                  >
                    {apiKey.trim() ? 'Finish' : 'Skip for now'}
                    <ArrowRight size={16} />
                  </Button>
                  <p className="text-center text-xs text-fg-subtle">
                    You can add or change your key later in Settings.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeroMark() {
  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-ketosis-good/25 to-ketosis-goodEnd/15 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-b from-ketosis-good to-ketosis-goodDeep text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.55),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M13 3 L4 14 L11 14 L10 21 L20 10 L13 10 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number }>;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ketosis-goodSoft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ketosis-goodDeep">
        <Icon size={11} /> {eyebrow}
      </span>
      <h2 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-[15px] leading-relaxed text-fg-muted">{subtitle}</p>
    </div>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1 rounded-full transition-all',
            i < step ? 'w-6 bg-ketosis-good' : 'w-4 bg-border',
          )}
        />
      ))}
    </div>
  );
}

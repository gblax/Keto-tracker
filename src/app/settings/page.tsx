'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  ExternalLink,
  Target,
  Zap,
  Key,
  Info,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useSettings } from '@/hooks/useSettings';
import { updateSettings } from '@/lib/db/settings';
import { maskApiKey } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const settings = useSettings();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function saveKey() {
    if (!apiKey.trim()) return;
    await updateSettings({ anthropicApiKey: apiKey.trim() });
    setApiKey('');
    flashSaved();
  }
  async function clearKey() {
    await updateSettings({ anthropicApiKey: undefined });
    flashSaved();
  }
  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <div className="flex flex-col pb-4">
      <PageHeader eyebrow="Preferences" title="Settings" />

      <div className="space-y-4 px-5">
        <SectionCard icon={Target} title="Daily targets">
          <p className="text-xs text-fg-hint">
            The progress ring fills up to your daily limit. The ketosis threshold drives the
            streak logic independently.
          </p>
          <div className="mt-4 space-y-1.5">
            <NumberSetting
              label="Daily net-carb limit"
              unit="g"
              value={settings.dailyLimitG}
              min={5}
              max={150}
              onChange={(v) => updateSettings({ dailyLimitG: v })}
            />
            <NumberSetting
              label="Ketosis threshold"
              unit="g"
              value={settings.ketosisThresholdG}
              min={5}
              max={150}
              onChange={(v) => updateSettings({ ketosisThresholdG: v })}
            />
            <NumberSetting
              label="Days under threshold for ketosis"
              value={settings.streakForKetosis}
              min={1}
              max={14}
              onChange={(v) => updateSettings({ streakForKetosis: v })}
            />
            <NumberSetting
              label="Grace days (tolerate blips)"
              value={settings.graceDays}
              min={0}
              max={3}
              onChange={(v) => updateSettings({ graceDays: v })}
            />
          </div>
        </SectionCard>

        <SectionCard icon={Key} title="Anthropic API key">
          <p className="text-xs text-fg-hint">
            Stored on this device only. Sent directly to{' '}
            <span className="font-mono text-fg-muted">api.anthropic.com</span>. Get a key from{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-ketosis-goodDeep underline underline-offset-2"
            >
              console.anthropic.com <ExternalLink size={11} />
            </a>
            .
          </p>

          {settings.anthropicApiKey && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-3 py-2 font-mono text-xs text-fg-muted">
              <span className="truncate">
                {showKey ? settings.anthropicApiKey : maskApiKey(settings.anthropicApiKey)}
              </span>
              <button
                aria-label={showKey ? 'Hide key' : 'Show key'}
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0 rounded-full p-1.5 text-fg-subtle transition-colors hover:bg-bg-elevated hover:text-fg"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={saveKey} disabled={!apiKey.trim()}>
              {settings.anthropicApiKey ? 'Replace' : 'Save'}
            </Button>
          </div>
          {settings.anthropicApiKey && (
            <div className="mt-3">
              <Button variant="destructive" size="sm" onClick={clearKey}>
                Clear key
              </Button>
            </div>
          )}
          {savedFlash && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ketosis-goodDeep">
              <Check size={12} /> Saved
            </p>
          )}
        </SectionCard>

        <SectionCard icon={Info} title="About">
          <p className="text-xs text-fg-hint">
            Keto Tracker stores all data locally in your browser (IndexedDB). Nothing leaves
            your device except the text you submit to the Anthropic API for parsing. Uninstall
            or clear site data to wipe everything.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-bg-elevated p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ketosis-goodSoft text-ketosis-goodDeep ring-1 ring-inset ring-ketosis-good/20">
          <Icon size={15} />
        </span>
        <h2 className="font-display text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NumberSetting({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void | Promise<unknown>;
}) {
  const [raw, setRaw] = useState(String(value));
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl px-1 py-2.5">
      <span className="text-sm text-fg">{label}</span>
      <div
        className={cn(
          'flex h-10 items-baseline rounded-lg border border-border bg-bg-card px-2.5',
        )}
      >
        <input
          inputMode="numeric"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => setRaw(String(value))}
          className="tnum w-10 bg-transparent text-right text-sm font-semibold text-fg focus:outline-none"
        />
        {unit && <span className="ml-0.5 text-[11px] text-fg-subtle">{unit}</span>}
      </div>
    </label>
  );
}

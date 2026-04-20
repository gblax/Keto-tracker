'use client';

import { useState } from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { useSettings } from '@/hooks/useSettings';
import { updateSettings } from '@/lib/db/settings';
import { maskApiKey } from '@/lib/format';

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
    <div className="flex flex-col">
      <PageHeader title="Settings" subtitle="Tailor the app to your keto routine." />

      <div className="space-y-4 px-5">
        <Card>
          <h2 className="font-display text-base font-semibold text-fg">Daily targets</h2>
          <p className="mt-1 text-xs text-fg-muted">
            The ring fills up to your daily limit; the ketosis threshold determines the streak
            logic.
          </p>
          <div className="mt-4 space-y-3">
            <NumberSetting
              label="Daily net-carb limit (g)"
              value={settings.dailyLimitG}
              min={5}
              max={150}
              onChange={(v) => updateSettings({ dailyLimitG: v })}
            />
            <NumberSetting
              label="Ketosis threshold (g)"
              value={settings.ketosisThresholdG}
              min={5}
              max={150}
              onChange={(v) => updateSettings({ ketosisThresholdG: v })}
            />
            <NumberSetting
              label="Days under threshold to count as in ketosis"
              value={settings.streakForKetosis}
              min={1}
              max={14}
              onChange={(v) => updateSettings({ streakForKetosis: v })}
            />
            <NumberSetting
              label="Grace days (single blips tolerated)"
              value={settings.graceDays}
              min={0}
              max={3}
              onChange={(v) => updateSettings({ graceDays: v })}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-fg">Anthropic API key</h2>
          <p className="mt-1 text-xs text-fg-muted">
            Your key is stored on this device only and used to call{' '}
            <span className="font-mono">api.anthropic.com</span> directly from your browser.
            Get one at{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 underline"
            >
              console.anthropic.com <ExternalLink size={11} />
            </a>
            .
          </p>

          {settings.anthropicApiKey ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2 font-mono text-xs text-fg-muted">
              <span>{showKey ? settings.anthropicApiKey : maskApiKey(settings.anthropicApiKey)}</span>
              <div className="flex items-center gap-2">
                <button
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                  onClick={() => setShowKey((v) => !v)}
                  className="rounded-full p-1.5 text-fg-subtle hover:bg-bg-elevated hover:text-fg"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="flex-1 font-mono"
            />
            <Button onClick={saveKey} disabled={!apiKey.trim()}>
              {settings.anthropicApiKey ? 'Replace' : 'Save'}
            </Button>
          </div>
          {settings.anthropicApiKey && (
            <div className="mt-2">
              <Button variant="destructive" size="sm" onClick={clearKey}>
                Clear key
              </Button>
            </div>
          )}
          {savedFlash && (
            <p className="mt-2 text-xs text-ketosis-good">Saved.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-fg">About</h2>
          <p className="mt-1 text-xs text-fg-muted">
            Keto Tracker stores all data locally in your browser (IndexedDB). Nothing leaves
            your device except the text you submit to the Anthropic API for parsing.
          </p>
        </Card>
      </div>
    </div>
  );
}

function NumberSetting({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void | Promise<unknown>;
}) {
  const [raw, setRaw] = useState(String(value));
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-fg">{label}</span>
      <input
        inputMode="numeric"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => setRaw(String(value))}
        className="tnum h-9 w-20 rounded-lg border border-border bg-bg px-2 text-right text-sm focus:outline-none focus-visible:border-ketosis-good/50"
      />
    </label>
  );
}

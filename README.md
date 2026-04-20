# Keto Tracker

A slick, installable Progressive Web App for tracking daily net carbohydrate
intake and inferring whether you are in ketosis.

Log what you ate in plain English (`"two eggs, avocado toast, and a banana"`);
Claude parses it into structured food items with net-carb estimates; the home
screen shows a progress ring against your daily limit and a ketosis badge
driven by a rolling streak of low-carb days.

## Features

- **Natural-language food entry** parsed by Claude Haiku 4.5 via the
  Anthropic SDK, using tool-use for guaranteed structured output.
- **Ketosis estimation** from a configurable rolling streak with a 1-day
  grace window — no blood or breath tests required.
- **Slick dark-first UI** inspired by Apple Health / Oura: hero progress ring
  with animated tabular numerics, bottom tab bar, smooth transitions.
- **Local-only** storage via IndexedDB (Dexie). No accounts, no backend. Your
  data never leaves the device; only the AI call hits `api.anthropic.com`.
- **PWA**: installable, offline shell, service worker precache via Serwist.
- **BYOK**: paste your own Anthropic API key in Settings.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + framer-motion + lucide-react
- Dexie + `dexie-react-hooks` (IndexedDB live queries)
- Zod for runtime validation of AI output
- Serwist (service worker / PWA)
- Vitest for unit tests

## Development

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # run unit tests
pnpm typecheck      # strict tsc
pnpm build          # production build (static-friendly)
```

On first launch you'll land on the onboarding flow. Set a daily net-carb
limit (default 20g) and paste an Anthropic API key — or skip and add it
later in Settings. Get a key at
[console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### Smoke test

1. Open `http://localhost:3000` → onboarding. Set limit 20, paste key.
2. Home: empty ring (0g), ketosis = "Gathering data".
3. Tap the green **+** tab → type `two eggs, avocado toast, and a banana`
   → **Parse with AI**.
4. Edit values if desired → **Save**. Ring animates to the new total; over
   20g flips the ring red and the badge to "Out of ketosis".
5. DevTools → Application → IndexedDB → `keto-tracker` has rows in
   `entries` and a `days[todayISO]` row with the net-carb sum.
6. Seed prior days for the streak (paste in DevTools console):

   ```js
   const { getDb } = await import('/_next/static/chunks/...schema.js'); // or use the app
   ```

   Easier: use the app for a few days, or add entries in the past by
   inserting into `entries` via the console.

## Architecture notes

- `src/lib/ai/parseFoods.ts` — calls Claude with the `extract_foods` tool and
  validates the response with Zod before returning typed items.
- `src/lib/ketosis.ts` — pure function mapping recent daily totals to a
  `KetosisState` + streak. Fully unit-tested.
- `src/lib/db/schema.ts` — Dexie v1 schema with `entries`, `days`, and a
  singleton `settings` row.
- `src/lib/db/entries.ts` — all writes go through `addEntries()` which
  recomputes the day total inside a single transaction, keeping the home ring
  a 1-row read.
- The Anthropic SDK runs in-browser with `dangerouslyAllowBrowser: true`.
  The user's key stays in IndexedDB and is only sent to `api.anthropic.com`.
  If you want to move calls server-side, the `parseFoods` function is the
  single integration seam — swap it for a `fetch('/api/parse')` without
  changing any UI.

## Icons

`public/icons/icon.svg` is the source. For Android Chrome install polish,
generate PNG variants (see `public/icons/README.md`).

## Post-MVP ideas

- 30-day heatmap calendar view
- Manual food search against a bundled mini-database
- JSON export / import backup
- Recent-foods favorites for 1-tap re-add
- Ketone meter log + correlation chart
- Optional Next.js API route proxying Claude for shared deployments

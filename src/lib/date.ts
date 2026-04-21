export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysAgoISO(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

export function rangeISO(days: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(daysAgoISO(i, from));
  return out;
}

export function shortDay(iso: string): string {
  const d = isoToDate(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function shortDate(iso: string): string {
  const d = isoToDate(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function longDate(iso: string): string {
  const d = isoToDate(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function isValidISO(s: string | null | undefined): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

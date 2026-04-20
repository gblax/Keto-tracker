export function formatGrams(g: number, digits = 1): string {
  if (!Number.isFinite(g)) return '0';
  if (g === 0) return '0';
  return g < 10 ? g.toFixed(digits) : Math.round(g).toString();
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function maskApiKey(key: string | undefined): string {
  if (!key) return '';
  if (key.length <= 12) return '•'.repeat(key.length);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

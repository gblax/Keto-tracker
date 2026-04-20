'use client';

import { useEffect, useState } from 'react';

function greet(h: number) {
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function Greeting() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now) {
    return (
      <div className="px-5 pt-10">
        <div className="h-4 w-20 rounded bg-bg-card" />
        <div className="mt-2 h-7 w-52 rounded bg-bg-card" />
      </div>
    );
  }
  return (
    <div className="px-5 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-fg-subtle">
        {formatDate(now)}
      </p>
      <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight text-fg">
        {greet(now.getHours())}.
      </h1>
    </div>
  );
}

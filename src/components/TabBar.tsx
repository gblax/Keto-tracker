'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, History, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/onboarding') return null;

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
    >
      <Link
        href="/add"
        aria-label="Log"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-ketosis-good to-ketosis-goodDeep text-white shadow-[0_6px_18px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-95"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>

      <ul className="pointer-events-auto flex items-stretch gap-1 rounded-full border border-border/80 bg-bg-elevated/95 p-1.5 shadow-tab backdrop-blur-xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={cn(
                  'flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-bg-card text-fg'
                    : 'text-fg-hint hover:bg-bg-card/70 hover:text-fg',
                )}
              >
                <Icon size={16} strokeWidth={2.25} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

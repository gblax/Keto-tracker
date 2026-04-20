'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, History, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/add', label: 'Add', icon: Plus, emphasized: true },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/onboarding') return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2">
        {TABS.map(({ href, label, icon: Icon, emphasized }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                  active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                    emphasized
                      ? 'h-10 w-10 bg-gradient-to-b from-ketosis-good to-ketosis-goodEnd text-black shadow-lg shadow-ketosis-good/30'
                      : active
                        ? 'bg-bg-elevated'
                        : '',
                  )}
                >
                  <Icon size={emphasized ? 22 : 18} strokeWidth={2.25} />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

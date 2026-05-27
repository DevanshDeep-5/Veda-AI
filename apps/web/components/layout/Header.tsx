'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, PlusCircle, LayoutDashboard, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/create',     label: 'New Paper',    icon: PlusCircle      },
  { href: '/assignments', label: 'My Papers',   icon: BookOpen        },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow-sm transition-transform group-hover:scale-110">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Veda<span className="text-brand-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-slate-400 hover:bg-surface-secondary hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/create"
          className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          Create Paper
        </Link>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center justify-center rounded-lg p-2.5 transition-all',
                  isActive
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

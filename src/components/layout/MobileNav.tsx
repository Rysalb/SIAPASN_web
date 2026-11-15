'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Trophy,
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  // Hide bottom bar during active CAT examination so it does not distract test-takers
  if (pathname.includes('/exam')) {
    return null;
  }

  const tabs = [
    { href: '/dashboard', label: 'Dashboard', icon: Layers },
    { href: '/materi', label: 'Materi', icon: BookOpen },
    { href: '/latihan', label: 'Latihan', icon: CheckSquare },
    { href: '/tryout', label: 'Tryout CAT', icon: GraduationCap },
    { href: '/leaderboard', label: 'Peringkat', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-lg border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-[var(--primary)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-[var(--primary-light)]' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


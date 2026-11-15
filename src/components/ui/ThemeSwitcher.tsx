'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '@/lib/theme';
import { Sun, Moon, Sparkles, Gem, ChevronDown } from 'lucide-react';

export function ThemeSwitcher({ minimal = false }: { minimal?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: { id: Theme; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'light',
      label: 'Light Clean',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      color: 'bg-white border-slate-300',
    },
    {
      id: 'dark',
      label: 'Obsidian Slate',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      color: 'bg-slate-900 border-slate-700',
    },
    {
      id: 'aquamarine',
      label: 'Aquamarine Glacial',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      color: 'bg-cyan-950 border-cyan-800',
    },
    {
      id: 'emerald',
      label: 'Emerald Jade',
      icon: <Gem className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-950 border-emerald-800',
    },
  ];

  const currentOption = themeOptions.find((t) => t.id === theme) || themeOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (minimal) {
    return (
      <button
        onClick={() => {
          const order: Theme[] = ['light', 'dark', 'aquamarine', 'emerald'];
          const next = order[(order.indexOf(theme) + 1) % order.length];
          setTheme(next);
        }}
        className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
        title={`Tema saat ini: ${currentOption.label}. Klik untuk ganti.`}
      >
        {currentOption.icon}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          {currentOption.icon}
          <span className="hidden sm:inline">{currentOption.label}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] mb-1">
            Pilih Tema Tampilan
          </div>
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setTheme(opt.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
                theme === opt.id
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.icon}
                <span>{opt.label}</span>
              </span>
              {theme === opt.id && (
                <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


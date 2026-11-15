'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'aquamarine' | 'emerald';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('siapasn_theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'aquamarine', 'emerald'].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme !== 'light') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setThemeState(initial);
      document.documentElement.setAttribute('data-theme', initial);
      if (prefersDark) document.documentElement.classList.add('dark');
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('siapasn_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme !== 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const themeCycle: Theme[] = ['light', 'dark', 'aquamarine', 'emerald'];
    const nextIndex = (themeCycle.indexOf(theme) + 1) % themeCycle.length;
    setTheme(themeCycle[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}


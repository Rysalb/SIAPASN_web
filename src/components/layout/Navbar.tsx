'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import {
  BookOpen,
  CheckSquare,
  GraduationCap,
  Trophy,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { href: '/materi', label: 'Materi Belajar', icon: <BookOpen className="w-4 h-4" /> },
    { href: '/latihan', label: 'Latihan Soal', icon: <CheckSquare className="w-4 h-4" /> },
    { href: '/tryout', label: 'Simulasi CAT', icon: <GraduationCap className="w-4 h-4" /> },
    { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" showTagline={false} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-[var(--primary)] bg-[var(--primary-light)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                pathname.startsWith('/admin')
                  ? 'text-white bg-indigo-600'
                  : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Actions (Theme Switcher + User Profile / Quick Login) */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {/* User Account or Login CTA */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--primary)] to-cyan-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-[var(--text-primary)] max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Administrator' : 'Peserta ASN'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                      Role: {user.role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Dashboard Saya</span>
                  </Link>

                  <Link
                    href="/profil"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil & Pengaturan</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Management</span>
                    </Link>
                  )}

                  <div className="border-t border-[var(--border)] pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-secondary text-xs px-3.5 py-1.5"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn btn-primary text-xs px-3.5 py-1.5 hidden sm:inline-flex"
              >
                Daftar Gratis
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}


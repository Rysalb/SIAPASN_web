'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  FileUp,
  Database,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { LoadingState, PermissionDeniedState } from '@/components/ui/UIStates';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        router.push('/login?redirect=/admin');
        return;
      }
      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Memverifikasi Otoritas Administrator..." />;

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="py-12">
        <PermissionDeniedState
          requiredRole="Administrator atau Super Admin"
          onBack={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  const menuItems = [
    { href: '/admin', label: 'Overview Statistik', icon: BarChart3, exact: true },
    { href: '/admin/pdf', label: 'Manajemen PDF & Parser', icon: FileUp },
    { href: '/admin/questions', label: 'Bank Soal CPNS', icon: Database },
    { href: '/admin/materials', label: 'Manajemen Materi', icon: BookOpen },
    { href: '/admin/packages', label: 'Paket Ujian & Tryout', icon: GraduationCap },
    { href: '/admin/users', label: 'Kelola Pengguna', icon: Users },
    { href: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="font-extrabold text-sm text-[var(--text-primary)]">Admin Panel</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[var(--bg-surface)] border-r border-[var(--border)] p-4 space-y-6 flex-shrink-0 z-20`}
      >
        <div className="hidden md:flex items-center gap-2.5 px-3 py-2 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Admin SIAPASN
            </h2>
            <span className="text-[10px] text-indigo-500 font-semibold">
              {user.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to student portal */}
        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Portal Peserta</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
        {children}
      </main>
    </div>
  );
}


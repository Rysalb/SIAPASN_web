'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { FormValidationError } from '@/components/ui/UIStates';
import { LogIn, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Lanjutkan latihan soal dan pantau perkembangan nilai tryout Anda
          </p>
        </div>

        {/* Login Card Form */}
        <div className="card p-6 sm:p-8 space-y-4 shadow-md">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-xs font-semibold flex items-center gap-2 border border-[var(--error)]/20">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="form-input text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-[var(--primary)] hover:underline cursor-pointer">
                  Lupa sandi?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-xs font-bold py-2.5 shadow-sm justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-1" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
            Belum memiliki akun?{' '}
            <Link href="/register" className="font-bold text-[var(--primary)] hover:underline">
              Daftar Gratis di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { UserPlus, ShieldAlert, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    province: 'DKI Jakarta',
    educationLevel: 'S1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registrasi gagal.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            Buat Akun SIAPASN Baru
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Gabung bersama ribuan calon abdi negara untuk persiapan seleksi CPNS 2024/2025
          </p>
        </div>

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
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Rian Pratama, S.Kom."
                className="form-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rian@email.com"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Provinsi Domisili
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="form-select text-xs"
                >
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="DI Yogyakarta">DI Yogyakarta</option>
                  <option value="Banten">Banten</option>
                  <option value="Sumatera Utara">Sumatera Utara</option>
                  <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                  <option value="Kalimantan Timur">Kalimantan Timur</option>
                  <option value="Lainnya">Provinsi Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Pendidikan Terakhir
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="form-select text-xs"
                >
                  <option value="SMA/SMK">SMA / SMK Sederajat</option>
                  <option value="D3">Diploma III (D3)</option>
                  <option value="D4/S1">Sarjana (S1 / D4)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="Dokter/Spesialis">Profesi / Spesialis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Kata Sandi (Minimal 6 Karakter)
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
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
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-[var(--primary)] hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


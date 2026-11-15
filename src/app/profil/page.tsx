'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Shield, Save, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '@/components/ui/UIStates';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        window.location.href = '/login';
        return;
      }
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Memuat profil Anda..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Profil & Pengaturan Akun
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Informasi identitas dan preferensi akun peserta ujian seleksi ASN Anda.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 shadow-sm">
        {/* User Avatar + Name Header */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-cyan-500 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{user?.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            <span className="badge badge-primary text-[10px] mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Read-only & Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="form-input text-xs bg-[var(--bg-base)] cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Alamat Email Terdaftar
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="form-input text-xs bg-[var(--bg-base)] cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="text"
              readOnly
              value={user?.profile?.phone || '081234567890'}
              className="form-input text-xs bg-[var(--bg-base)] cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Provinsi Domisili
            </label>
            <input
              type="text"
              readOnly
              value={user?.profile?.province || 'DKI Jakarta'}
              className="form-input text-xs bg-[var(--bg-base)] cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Pendidikan Terakhir
            </label>
            <input
              type="text"
              readOnly
              value={user?.profile?.educationLevel || 'Sarjana (S1)'}
              className="form-input text-xs bg-[var(--bg-base)] cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1">
              Status Keanggotaan
            </label>
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] text-xs flex items-center justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Akun Aktif</span>
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] text-right">
          <span className="text-[11px] text-[var(--text-muted)]">
            Untuk merubah email dan nama lengkap resmi, silakan hubungi administrator.
          </span>
        </div>
      </div>
    </div>
  );
}


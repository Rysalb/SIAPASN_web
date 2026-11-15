'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/UIStates';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    passing_grade_twk: '65',
    passing_grade_tiu: '80',
    passing_grade_tkp: '166',
    default_exam_duration: '100',
    app_disclaimer:
      'Platform ini merupakan sarana simulasi dan persiapan mandiri. Nilai hasil simulasi bukan merupakan jaminan atau hasil resmi dari Badan Kepegawaian Negara (BKN).',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings && Array.isArray(data.settings)) {
        const map: Record<string, string> = {};
        data.settings.forEach((s: any) => {
          map[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan pengaturan.');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Memuat konfigurasi sistem..." />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          Pengaturan Sistem & Ketentuan Ujian
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Konfigurasi nilai ambang batas (passing grade), durasi standar simulasi, dan teks kebijakan platform.
        </p>
      </div>

      <form onSubmit={handleSave} className="card p-6 sm:p-8 space-y-6 shadow-sm">
        {savedSuccess && (
          <div className="p-3 rounded-lg bg-[var(--success-light)] text-[var(--success-foreground)] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan berhasil disimpan ke dalam basis data.</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Nilai Ambang Batas (Passing Grade) Standar BKN
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Passing Grade TWK
              </label>
              <input
                type="number"
                required
                value={settings.passing_grade_twk}
                onChange={(e) =>
                  setSettings({ ...settings, passing_grade_twk: e.target.value })
                }
                className="form-input text-xs"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                PermenPAN standar: 65 poin
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Passing Grade TIU
              </label>
              <input
                type="number"
                required
                value={settings.passing_grade_tiu}
                onChange={(e) =>
                  setSettings({ ...settings, passing_grade_tiu: e.target.value })
                }
                className="form-input text-xs"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                PermenPAN standar: 80 poin
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Passing Grade TKP
              </label>
              <input
                type="number"
                required
                value={settings.passing_grade_tkp}
                onChange={(e) =>
                  setSettings({ ...settings, passing_grade_tkp: e.target.value })
                }
                className="form-input text-xs"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                PermenPAN standar: 166 poin
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Durasi & Informasi Ujian
          </h3>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
              Durasi Ujian Standar (Menit)
            </label>
            <input
              type="number"
              required
              min={30}
              max={180}
              value={settings.default_exam_duration}
              onChange={(e) =>
                setSettings({ ...settings, default_exam_duration: e.target.value })
              }
              className="form-input text-xs max-w-xs"
            />
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Durasi CAT SKD formasi umum adalah 100 menit (110 soal).
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
              Catatan Disclaimer Hasil Ujian (Wajib Muncul pada Laporan)
            </label>
            <textarea
              rows={3}
              value={settings.app_disclaimer}
              onChange={(e) =>
                setSettings({ ...settings, app_disclaimer: e.target.value })
              }
              className="form-textarea text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary text-xs font-bold px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}


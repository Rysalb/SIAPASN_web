'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  Bookmark,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/UIStates';

export default function UserDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Gagal memuat ringkasan dashboard.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Memuat Dashboard Anda..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { user, stats, recentAttempts, recommendedPackages } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome Greeting Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-lg border-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
            Calon Aparatur Sipil Negara
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Terus tingkatkan latihan rutin untuk menguasai passing grade SKD (TWK 65, TIU 80, TKP 166). Konsistensi adalah kunci menembus NIP tahun ini.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/tryout"
              className="inline-flex items-center gap-2 bg-amber-400 text-blue-950 font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-md hover:bg-amber-300 transition-all"
            >
              <Zap className="w-4 h-4 fill-blue-950" />
              <span>Mulai Tryout Hari Ini</span>
            </Link>
            <Link
              href="/latihan"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <span>Latihan Drill Cepat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Score */}
        <div className="card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Skor Tertinggi</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {stats.highestScore || '-'}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Maksimal skor SKD adalah 550
          </p>
        </div>

        {/* Average Score */}
        <div className="card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Rata-Rata Skor</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {stats.averageScore || '-'}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Dari {stats.totalAttempts} simulasi tryout
          </p>
        </div>

        {/* Passed Status */}
        <div className="card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Lolos Passing Grade</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--success)]">
            {stats.passedCount} / {stats.totalAttempts}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Tingkat kelulusan: {stats.totalAttempts ? Math.round((stats.passedCount / stats.totalAttempts) * 100) : 0}%
          </p>
        </div>

        {/* Materials Studied */}
        <div className="card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Materi Dipelajari</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {stats.completedChapters}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Bab materi selesai dipelajari
          </p>
        </div>
      </div>

      {/* 3. Diagnostic Weakness & Recommendation (PRD Section 11 line 651) */}
      <div className="card p-6 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Analisis Kesiapan & Rekomendasi Belajar
              </h3>
              <span className="badge badge-warning text-[10px]">
                Fokus Subtes: {stats.analysis.weakCategory}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {stats.analysis.recommendation}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
              <span>Rata-rata TWK: <strong>{stats.categoryAverages.twk}</strong> / 150</span>
              <span>•</span>
              <span>Rata-rata TIU: <strong>{stats.categoryAverages.tiu}</strong> / 175</span>
              <span>•</span>
              <span>Rata-rata TKP: <strong>{stats.categoryAverages.tkp}</strong> / 225</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Attempts & Recommended Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Recent Attempts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Riwayat Tryout Terakhir
            </h2>
            <Link href="/riwayat" className="text-xs font-bold text-[var(--primary)] hover:underline">
              Lihat Semua
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="card p-8 text-center text-xs text-[var(--text-muted)] space-y-3">
              <GraduationCap className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
              <p>Anda belum pernah menyelesaikan simulasi ujian.</p>
              <Link href="/tryout" className="btn btn-primary text-xs">
                Mulai Ujian Pertama Anda
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt: any) => (
                <div
                  key={attempt.id}
                  className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-hoverable"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
                      {new Date(attempt.endedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {attempt.examPackage.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      <span>TWK: <strong>{attempt.result?.twkScore}</strong></span>
                      <span>TIU: <strong>{attempt.result?.tiuScore}</strong></span>
                      <span>TKP: <strong>{attempt.result?.tkpScore}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <div className="text-right">
                      <span className="text-lg font-black text-[var(--text-primary)]">
                        {attempt.result?.totalScore}
                      </span>
                      <div>
                        {attempt.result?.isPassed ? (
                          <span className="badge badge-success text-[10px]">LULUS PG</span>
                        ) : (
                          <span className="badge badge-error text-[10px]">BELUM LULUS</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/tryout/${attempt.examPackageId}/result/${attempt.id}`}
                      className="btn btn-secondary text-xs p-2"
                      title="Lihat Pembahasan Lengkap"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Access Tryout */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Paket Tryout Direkomendasikan
          </h2>

          <div className="space-y-3">
            {recommendedPackages.map((pkg: any) => (
              <div key={pkg.id} className="card p-4 space-y-2 card-hoverable">
                <span className="badge badge-primary text-[10px]">
                  {pkg.totalQuestions || 100} Butir Soal
                </span>
                <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2">
                  {pkg.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                  {pkg.description || 'Simulasi CAT terstandar BKN dengan komposisi lengkap.'}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{pkg.durationMinutes} Menit</span>
                  </span>
                  <Link
                    href={`/tryout`}
                    className="btn btn-primary text-[11px] py-1 px-3"
                  >
                    Kerjakan
                  </Link>
                </div>
              </div>
            ))}

            {/* Quick drill link */}
            <div className="card p-4 border-dashed border-2 text-center space-y-2">
              <Zap className="w-6 h-6 mx-auto text-amber-500" />
              <h5 className="text-xs font-bold text-[var(--text-primary)]">
                Latihan Mandiri Per Kategori
              </h5>
              <p className="text-[11px] text-[var(--text-muted)]">
                Latih kelemahan spesifikmu di TWK, TIU, atau TKP dengan pembahasan langsung.
              </p>
              <Link href="/latihan" className="btn btn-secondary text-xs w-full justify-center">
                Mulai Latihan Drill
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


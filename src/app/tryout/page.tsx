'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { LoadingState } from '@/components/ui/UIStates';

export default function TryoutCatalogPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/exam/packages');
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Computer Assisted Test (CAT) BKN Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Simulasi Tryout Nasional CPNS
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
          Uji kesiapan Anda dalam simulasi ujian yang presisi: durasi 100 menit, kisi-kisi warna nomor soal, autosave jawaban secara real-time, dan evaluasi passing grade resmi.
        </p>
      </div>

      {/* Passing Grade Policy Card (PermenPAN-RB Reference) */}
      <div className="card p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold tracking-wide">
                Standar Nilai Ambang Batas (Passing Grade) SKD
              </h3>
            </div>
            <p className="text-[11px] text-blue-200">
              Acuan resmi PermenPAN-RB untuk formasi umum. Anda harus memenuhi batas minimal pada ketiga subtes sekaligus.
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">TWK</span>
              <span className="text-sm font-black text-amber-300">65</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">TIU</span>
              <span className="text-sm font-black text-cyan-300">80</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">TKP</span>
              <span className="text-sm font-black text-emerald-300">166</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <LoadingState message="Memuat daftar paket ujian..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const pastAttempts = pkg.attempts || [];
            const lastAttempt = pastAttempts[0];

            return (
              <div
                key={pkg.id}
                className="card p-6 flex flex-col justify-between card-hoverable space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary text-[10px] uppercase font-bold">
                      {pkg.examType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.durationMinutes} Menit</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {pkg.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {pkg.description || 'Simulasi ujian lengkap dengan 110 butir soal standar BKN.'}
                  </p>

                  <div className="border-t border-[var(--border)] pt-3 text-xs space-y-1.5 text-[var(--text-secondary)]">
                    <div className="flex justify-between">
                      <span>Total Soal:</span>
                      <strong className="text-[var(--text-primary)]">{pkg._count?.questions || pkg.totalQuestions} Butir</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Grade:</span>
                      <strong className="text-[var(--text-primary)]">
                        {pkg.passingGradeTwk} / {pkg.passingGradeTiu} / {pkg.passingGradeTkp}
                      </strong>
                    </div>
                  </div>

                  {/* Past score badge if attempted */}
                  {lastAttempt && (
                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] text-xs flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-muted)]">Skor Terakhir:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-[var(--text-primary)]">
                          {lastAttempt.result?.totalScore || lastAttempt.totalScore || '-'}
                        </strong>
                        {lastAttempt.result?.isPassed ? (
                          <span className="badge badge-success text-[9px]">LULUS PG</span>
                        ) : (
                          <span className="badge badge-error text-[9px]">BELUM LULUS</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <Link
                    href={`/tryout/${pkg.id}/exam`}
                    className="btn btn-primary w-full text-xs font-bold justify-center shadow-sm"
                  >
                    <span>{lastAttempt ? 'Ulangi Ujian' : 'Mulai Ujian CAT'}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


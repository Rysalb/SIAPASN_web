'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function ExamHistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/exam/history');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Gagal memuat riwayat.');
      }
      const data = await res.json();
      setAttempts(data.attempts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Memuat riwayat ujian..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Riwayat Simulasi Ujian
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Daftar seluruh tryout CAT yang telah Anda selesaikan beserta skor dan evaluasi kelulusan.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          title="Belum Ada Riwayat Ujian"
          description="Anda belum menyelesaikan simulasi ujian. Mulai simulasi pertama Anda sekarang."
          actionLabel="Pilih Paket Ujian"
          onAction={() => (window.location.href = '/tryout')}
        />
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => (
            <div
              key={att.id}
              className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hoverable"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(att.endedAt || att.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {att.examPackage.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span>TWK: <strong>{att.result?.twkScore}</strong> (Min: {att.examPackage.passingGradeTwk})</span>
                  <span>TIU: <strong>{att.result?.tiuScore}</strong> (Min: {att.examPackage.passingGradeTiu})</span>
                  <span>TKP: <strong>{att.result?.tkpScore}</strong> (Min: {att.examPackage.passingGradeTkp})</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                <div className="text-right">
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    {att.result?.totalScore || att.totalScore}
                  </span>
                  <div>
                    {att.result?.isPassed ? (
                      <span className="badge badge-success text-[10px]">LULUS PG</span>
                    ) : (
                      <span className="badge badge-error text-[10px]">BELUM LULUS</span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/tryout/${att.examPackageId}/result/${att.id}`}
                  className="btn btn-secondary text-xs px-3 py-2"
                >
                  <span>Pembahasan</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


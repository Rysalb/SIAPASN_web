'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Layers,
  Trophy,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/UIStates';

export default function ExamResultDetailPage() {
  const params = useParams();
  const packageId = params?.packageId as string;
  const attemptId = params?.attemptId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (attemptId) fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exam/results/${attemptId}`);
      if (!res.ok) throw new Error('Hasil ujian tidak ditemukan.');
      const json = await res.json();
      setData(json);

      // Trigger celebratory confetti if passed!
      if (json.result?.isPassed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Initialize favorites
      const favMap: Record<string, boolean> = {};
      json.questions.forEach((q: any) => {
        if (q.isFavorited) favMap[q.questionId] = true;
      });
      setFavorites(favMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (questionId: string) => {
    const nextState = !favorites[questionId];
    setFavorites((prev) => ({ ...prev, [questionId]: nextState }));

    try {
      await fetch('/api/practice/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingState message="Menghitung dan memuat hasil evaluasi ujian..." />;
  if (error || !data) return <ErrorState message={error || 'Hasil tidak ditemukan'} onRetry={fetchResult} />;

  const { result, weakTopics, questions } = data;

  const twkPassed = result.twkScore >= data.passingGradeTwk;
  const tiuPassed = result.tiuScore >= data.passingGradeTiu;
  const tkpPassed = result.tkpScore >= data.passingGradeTkp;

  const filteredQuestions = questions.filter((q: any) => {
    if (categoryFilter !== 'ALL' && q.categoryCode !== categoryFilter) return false;
    if (statusFilter === 'CORRECT') {
      return q.pointsEarned === 5;
    }
    if (statusFilter === 'WRONG') {
      return q.pointsEarned < 5;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Result Header & Pass Banner */}
      <div
        className={`card p-6 sm:p-10 text-center relative overflow-hidden shadow-lg border-2 ${
          result.isPassed
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
        }`}
      >
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {result.isPassed ? (
              <span className="badge badge-success text-xs font-bold py-1 px-3">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                MEMENUHI PASSING GRADE (LULUS SKD)
              </span>
            ) : (
              <span className="badge badge-error text-xs font-bold py-1 px-3">
                <AlertTriangle className="w-4 h-4 mr-1" />
                BELUM MEMENUHI PASSING GRADE
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)]">
            {result.totalScore}
            <span className="text-xs sm:text-base font-semibold text-[var(--text-muted)] ml-2">
              / 550 Poin Maksimal
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {result.isPassed
              ? 'Selamat! Nilai simulasi Anda telah melampaui seluruh ambang batas (TWK, TIU, TKP). Pertahankan konsistensi ini hingga hari ujian CAT sesungguhnya.'
              : 'Tetap semangat! Masih ada subtes yang nilainya berada di bawah passing grade. Evaluasi kembali pembahasan soal di bawah untuk memperkuat penguasaan materi.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/tryout`} className="btn btn-secondary text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Coba Paket Lain</span>
            </Link>
            <Link href="/leaderboard" className="btn btn-secondary text-xs">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              <span>Lihat Leaderboard</span>
            </Link>
            <Link href="/dashboard" className="btn btn-primary text-xs">
              <Layers className="w-3.5 h-3.5 mr-1" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Subtest Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TWK Card */}
        <div className="card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Tes Wawasan Kebangsaan</span>
            <span
              className={`badge text-[10px] font-bold ${
                twkPassed ? 'badge-success' : 'badge-error'
              }`}
            >
              {twkPassed ? 'Lolos' : 'Gagal'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {result.twkScore}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ 150</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex justify-between">
            <span>Passing Grade:</span>
            <strong>{data.passingGradeTwk}</strong>
          </div>
        </div>

        {/* TIU Card */}
        <div className="card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Tes Intelegensia Umum</span>
            <span
              className={`badge text-[10px] font-bold ${
                tiuPassed ? 'badge-success' : 'badge-error'
              }`}
            >
              {tiuPassed ? 'Lolos' : 'Gagal'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {result.tiuScore}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ 175</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex justify-between">
            <span>Passing Grade:</span>
            <strong>{data.passingGradeTiu}</strong>
          </div>
        </div>

        {/* TKP Card */}
        <div className="card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Tes Karakteristik Pribadi</span>
            <span
              className={`badge text-[10px] font-bold ${
                tkpPassed ? 'badge-success' : 'badge-error'
              }`}
            >
              {tkpPassed ? 'Lolos' : 'Gagal'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {result.tkpScore}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ 225</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex justify-between">
            <span>Passing Grade:</span>
            <strong>{data.passingGradeTkp}</strong>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic Weakness Alerts */}
      {weakTopics && weakTopics.length > 0 && (
        <div className="card p-5 border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Topik yang Perlu Diperbaiki (Akurasi di bawah 70%):</span>
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {weakTopics.map((wt: any, idx: number) => (
              <span
                key={idx}
                className="badge badge-warning text-[11px] font-semibold py-1 px-2.5"
              >
                {wt.topic} (Akurasi: {wt.accuracy}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Detailed Question Review Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">
              Bedah Soal & Pembahasan Lengkap
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Pelajari kunci jawaban resmi dan langkah pembahasan untuk tiap butir soal.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select text-xs py-1 px-2.5 w-auto"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="TWK">TWK Saja</option>
              <option value="TIU">TIU Saja</option>
              <option value="TKP">TKP Saja</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="form-select text-xs py-1 px-2.5 w-auto"
            >
              <option value="ALL">Semua Status</option>
              <option value="CORRECT">Jawaban Benar</option>
              <option value="WRONG">Jawaban Salah / Kosong</option>
            </select>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q: any) => {
            const isTkp = q.categoryCode === 'TKP';
            const isUserCorrect = q.pointsEarned === 5;
            const isAnswered = Boolean(q.userAnswer);

            return (
              <div key={q.questionId} className="card p-6 space-y-4">
                {/* Header item */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--text-primary)]">
                      Nomor {q.number}
                    </span>
                    <span className="badge badge-primary text-[10px]">
                      {q.categoryCode} • {q.subcategoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[var(--text-primary)]">
                      Poin: {q.pointsEarned}
                    </span>
                    <button
                      onClick={() => toggleFavorite(q.questionId)}
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        favorites[q.questionId]
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-amber-500'
                      }`}
                      title="Simpan ke favorit"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${favorites[q.questionId] ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                  {q.questionText}
                </div>

                {/* Options display with user vs correct markings */}
                <div className="space-y-2">
                  {q.options.map((opt: any) => {
                    const isSelected = q.userAnswer?.id === opt.id;
                    const isCorrect = q.correctAnswer?.id === opt.id;

                    let optStyle = 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]';

                    if (isTkp) {
                      if (isSelected) {
                        optStyle = 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-bold';
                      }
                    } else {
                      if (isCorrect) {
                        optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                      } else if (isSelected) {
                        optStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 line-through';
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optStyle}`}
                      >
                        <span className="font-bold w-5 h-5 rounded flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-secondary)] flex-shrink-0 text-[11px]">
                          {opt.label}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isTkp && (
                          <span className="badge badge-primary text-[10px]">
                            Bobot: {opt.scoreWeight}
                          </span>
                        )}
                        {isSelected && !isCorrect && !isTkp && (
                          <span className="badge badge-error text-[10px]">Jawaban Anda</span>
                        )}
                        {isSelected && isCorrect && !isTkp && (
                          <span className="badge badge-success text-[10px]">Benar (Pilihan Anda)</span>
                        )}
                        {!isSelected && isCorrect && !isTkp && (
                          <span className="badge badge-success text-[10px]">Kunci Jawaban</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Discussion */}
                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                  <span className="font-bold text-[var(--text-primary)] block">Pembahasan:</span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


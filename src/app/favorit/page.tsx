'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function BookmarkedQuestionsPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/practice/favorite');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Gagal memuat soal favorit.');
      }
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (questionId: string) => {
    setFavorites((prev) => prev.filter((f) => f.questionId !== questionId));
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

  if (loading) return <LoadingState message="Memuat soal tersimpan..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Bank Soal Favorit Saya
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Kumpulan soal-soal sulit yang Anda tandai untuk dipelajari kembali sebelum hari ujian.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="Belum Ada Soal Favorit"
          description="Anda dapat menandai soal saat latihan atau saat melihat pembahasan hasil tryout."
          actionLabel="Mulai Latihan Soal"
          onAction={() => (window.location.href = '/latihan')}
        />
      ) : (
        <div className="space-y-4">
          {favorites.map((fav) => {
            const q = fav.question;
            const correctOpt = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];

            return (
              <div key={fav.id} className="card p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <span className="badge badge-primary text-[10px]">
                    {q.category?.code} • {q.subcategory?.name || 'Umum'}
                  </span>
                  <button
                    onClick={() => removeFavorite(q.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs flex items-center gap-1"
                    title="Hapus dari favorit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                  {q.questionText}
                </div>

                <div className="space-y-2">
                  {q.options?.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-secondary)] text-[11px] font-bold">
                        {opt.optionLabel}
                      </span>
                      <span className="flex-1">{opt.optionText}</span>
                      {opt.isCorrect && (
                        <span className="badge badge-success text-[10px]">Kunci Jawaban</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                  <strong className="text-[var(--text-primary)] block">Pembahasan Lengkap:</strong>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


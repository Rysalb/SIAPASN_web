'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function PracticeDrillPage() {
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // User state per question
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const startPractice = async () => {
    setLoading(true);
    try {
      const url = `/api/practice/questions?category=${category}&difficulty=${difficulty}&count=${questionCount}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setUserAnswers({});

      // Set initial favorites
      const favMap: Record<string, boolean> = {};
      (data.questions || []).forEach((q: any) => {
        if (q.isFavorited) favMap[q.id] = true;
      });
      setFavorites(favMap);
      setIsStarted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionLabel: string) => {
    // Only set if not already answered
    if (!userAnswers[currentIndex]) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentIndex]: optionLabel,
      }));
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

  const currentQ = questions[currentIndex];
  const currentAnswer = userAnswers[currentIndex];
  const isAnswered = Boolean(currentAnswer);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Mode Latihan Mandiri (Instant Feedback)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Latihan Soal & Bedah Kunci Jawaban
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Pilih kategori dan jumlah soal sesuai kebutuhan belajar Anda. Langsung periksa pembahasan detail setelah memilih jawaban.
        </p>
      </div>

      {!isStarted ? (
        /* Configuration Screen */
        <div className="card p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Filter className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Kustomisasi Sesi Latihan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Kategori Soal
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select text-xs"
              >
                <option value="ALL">Semua Kategori (Campuran)</option>
                <option value="TWK">TWK – Wawasan Kebangsaan</option>
                <option value="TIU">TIU – Intelegensia Umum</option>
                <option value="TKP">TKP – Karakteristik Pribadi</option>
              </select>
            </div>

            {/* Difficulty selection */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select text-xs"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="EASY">Mudah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HARD">Sulit (HOTS)</option>
              </select>
            </div>

            {/* Question count */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Jumlah Soal
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="form-select text-xs"
              >
                <option value={10}>10 Soal (Drill Kilat)</option>
                <option value={20}>20 Soal (Sesi Sedang)</option>
                <option value={30}>30 Soal (Sesi Intensif)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button
              onClick={startPractice}
              disabled={loading}
              className="btn btn-primary text-xs font-bold px-6 py-2.5 shadow-sm"
            >
              <span>Mulai Latihan Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      ) : loading ? (
        <LoadingState message="Menyiapkan soal latihan..." />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Soal yang Sesuai"
          description="Silakan coba pilih filter kategori atau tingkat kesulitan yang lain."
          actionLabel="Ubah Filter"
          onAction={() => setIsStarted(false)}
        />
      ) : (
        /* Active Drill Screen */
        <div className="space-y-6">
          {/* Top Progress bar and question indicator */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Soal {currentIndex + 1} dari {questions.length}
              </span>
              <span className="badge badge-primary text-[10px]">
                {currentQ.category} • {currentQ.subcategory}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(currentQ.id)}
                className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1 ${
                  favorites[currentQ.id]
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-amber-500'
                }`}
                title="Tandai sebagai soal favorit"
              >
                <Bookmark className={`w-3.5 h-3.5 ${favorites[currentQ.id] ? 'fill-white' : ''}`} />
                <span className="hidden sm:inline">Favorit</span>
              </button>

              <button
                onClick={() => setIsStarted(false)}
                className="btn btn-secondary text-xs py-1.5 px-3"
              >
                Ganti Sesi
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="card p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-relaxed">
              {currentQ.questionText}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt: any) => {
                const isSelected = currentAnswer === opt.label;
                const isCorrect = opt.label === currentQ.correctLabel;
                const isTkp = currentQ.category === 'TKP';

                let optionClass = 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]';

                if (isAnswered) {
                  if (isTkp) {
                    if (isSelected) {
                      optionClass = 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-bold';
                    }
                  } else {
                    if (isCorrect) {
                      optionClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (isSelected) {
                      optionClass = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 line-through';
                    }
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.label)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${optionClass}`}
                  >
                    <span className="w-6 h-6 rounded-lg font-bold flex items-center justify-center flex-shrink-0 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)] text-xs">
                      {opt.label}
                    </span>
                    <span className="flex-1 pt-0.5">{opt.text}</span>
                    {isAnswered && isTkp && (
                      <span className="badge badge-primary text-[10px] ml-2">
                        Poin: {opt.scoreWeight}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Discussion Section (Appears right after answering!) */}
            {isAnswered && (
              <div className="card p-5 bg-[var(--primary-light)]/40 border-[var(--primary)]/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentAnswer === currentQ.correctLabel ? (
                      <span className="badge badge-success text-xs flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban Anda Benar
                      </span>
                    ) : currentQ.category === 'TKP' ? (
                      <span className="badge badge-primary text-xs flex items-center gap-1 font-bold">
                        Pilihan Anda Terpilih
                      </span>
                    ) : (
                      <span className="badge badge-error text-xs flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Jawaban Kurang Tepat
                      </span>
                    )}
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Kunci: {currentQ.correctLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] block">Pembahasan Lengkap:</span>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="btn btn-secondary text-xs disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Sebelumnya</span>
              </button>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="btn btn-primary text-xs disabled:opacity-30"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


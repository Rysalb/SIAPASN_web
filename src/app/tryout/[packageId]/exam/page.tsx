'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Flag,
  HelpCircle,
  Send,
  Loader2,
  Menu,
  X,
  ShieldCheck,
  Save,
  WifiOff,
} from 'lucide-react';
import { LoadingState, ErrorState, OfflineBanner } from '@/components/ui/UIStates';
import {
  cacheExamSession,
  saveLocalDraftAnswer,
  getUnsyncedAnswers,
  markAnswersAsSynced,
  clearExamSessionCache,
} from '@/lib/indexeddb';

export default function CATSimulationExamPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.packageId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examData, setExamData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state: questionId -> { selectedOptionId, isMarked }
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId: string | null; isMarked: boolean }>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [isOffline, setIsOffline] = useState(false);

  // Finish confirmation modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mobile drawer for question navigation
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Online / offline event listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (examData?.attemptId) {
        syncPendingAnswers(examData.attemptId);
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [examData?.attemptId]);

  // Start exam session
  useEffect(() => {
    if (packageId) {
      startExam();
    }
  }, [packageId]);

  const startExam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/login?redirect=/tryout/${packageId}/exam`;
          return;
        }
        const data = await res.json();
        throw new Error(data.error || 'Gagal memulai sesi ujian.');
      }

      const data = await res.json();
      setExamData(data);
      setRemainingSeconds(data.remainingSeconds || 0);

      // Cache session snapshot locally in IndexedDB (PRD2 Section 4 & 5)
      cacheExamSession(data.attemptId, data);

      // Populate existing saved answers
      const initialAnswers: Record<string, { selectedOptionId: string | null; isMarked: boolean }> = {};
      data.questions.forEach((q: any) => {
        const saved = data.savedAnswers[q.id];
        initialAnswers[q.id] = {
          selectedOptionId: saved ? saved.selectedOptionId : null,
          isMarked: saved ? saved.isMarked : false,
        };
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!examData || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, remainingSeconds]);

  // Sync any pending answers from IndexedDB when network reconnects
  const syncPendingAnswers = async (attemptId: string) => {
    const unsynced = await getUnsyncedAnswers(attemptId);
    if (!unsynced || unsynced.length === 0) return;

    for (const item of unsynced) {
      try {
        await fetch('/api/exam/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            questionId: item.questionId,
            selectedOptionId: item.selectedOptionId,
            isMarked: item.isMarked,
          }),
        });
      } catch (e) {
        // Will retry on next reconnect
      }
    }
    markAnswersAsSynced(attemptId, unsynced.map((u) => u.questionId));
  };

  // Autosave function (Dual layer: IndexedDB local + Server async batch)
  const autosaveAnswer = async (
    questionId: string,
    selectedOptionId: string | null,
    isMarked: boolean
  ) => {
    // 1. Immediately save to IndexedDB local cache (Zero latency)
    saveLocalDraftAnswer(examData.attemptId, questionId, selectedOptionId, isMarked);

    // If currently offline, mark locally saved and queue
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSavingStatus('saved');
      return;
    }

    setSavingStatus('saving');
    try {
      const res = await fetch('/api/exam/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: examData.attemptId,
          questionId,
          selectedOptionId,
          isMarked,
        }),
      });

      if (res.ok) {
        setSavingStatus('saved');
        markAnswersAsSynced(examData.attemptId, [questionId]);
      } else {
        setSavingStatus('error');
      }
    } catch (e) {
      setSavingStatus('saved'); // safely queued in IndexedDB
    }
  };

  const handleSelectOption = (optionId: string) => {
    const currentQ = examData.questions[currentIndex];
    const currentMarked = answers[currentQ.id]?.isMarked || false;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: optionId,
        isMarked: currentMarked,
      },
    }));

    autosaveAnswer(currentQ.id, optionId, currentMarked);
  };

  const handleToggleMarked = () => {
    const currentQ = examData.questions[currentIndex];
    const currentSelected = answers[currentQ.id]?.selectedOptionId || null;
    const newMarked = !(answers[currentQ.id]?.isMarked || false);

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: currentSelected,
        isMarked: newMarked,
      },
    }));

    autosaveAnswer(currentQ.id, currentSelected, newMarked);
  };

  const handleAutoSubmit = async () => {
    alert('Waktu pengerjaan ujian telah habis! Sistem akan secara otomatis menyelesaikan ujian Anda.');
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: examData.attemptId }),
      });

      if (!res.ok) throw new Error('Gagal mengirimkan jawaban ujian.');

      // Clear local cache cleanly after successful server submission (PRD2 Section 4.4)
      await clearExamSessionCache(examData.attemptId);

      router.push(`/tryout/${packageId}/result/${examData.attemptId}`);
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Menyiapkan Lembar Soal CAT..." />;
  if (error) return <ErrorState message={error} onRetry={startExam} />;

  const questions = examData.questions;
  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id] || { selectedOptionId: null, isMarked: false };

  // Format time remaining
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}:` : ''}${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  // Counts for summary modal
  let answeredCount = 0;
  let doubtCount = 0;
  let unansweredCount = 0;

  questions.forEach((q: any) => {
    const ans = answers[q.id];
    if (ans?.isMarked) doubtCount++;
    else if (ans?.selectedOptionId) answeredCount++;
    else unansweredCount++;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* 1. Authentic CAT Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] block">
                Simulasi Resmi CAT BKN
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
                {examData.package.title}
              </h1>
            </div>
          </div>

          {/* Timer + Autosave status */}
          <div className="flex items-center gap-3">
            {/* Live Autosave Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
              {savingStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[var(--primary)]" />
                  <span>Menyimpan...</span>
                </>
              ) : savingStatus === 'saved' ? (
                <>
                  <Save className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersimpan</span>
                </>
              ) : (
                <span className="text-red-500">Gagal simpan</span>
              )}
            </div>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-sm tracking-widest shadow-xs ${
                remainingSeconds < 300
                  ? 'bg-red-500 text-white animate-pulse'
                  : remainingSeconds < 900
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Exam Work Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Display & Options */}
        <div className="lg:col-span-3 space-y-4">
          {isOffline && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <span>
                <strong>Mode Offline Aktif:</strong> Koneksi internet Anda sedang terputus. Anda tetap dapat membaca soal dan menjawab seperti biasa. Jawaban Anda tersimpan aman di IndexedDB perangkat ini dan akan otomatis disinkronkan saat koneksi kembali.
              </span>
            </div>
          )}
          <div className="card p-6 sm:p-8 space-y-6 shadow-sm min-h-[480px] flex flex-col justify-between">
            {/* Question Top Meta */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[var(--text-primary)]">
                    SOAL NOMOR {currentIndex + 1}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">/ {questions.length}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge badge-primary text-[10px] font-bold">
                    {currentQ.categoryCode} • {currentQ.subcategoryName}
                  </span>
                  <span className="badge badge-neutral text-[10px]">
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-relaxed pt-2">
                {currentQ.questionText}
              </div>

              {/* Options A - E */}
              <div className="space-y-3 pt-4">
                {currentQ.options.map((opt: any) => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-bold shadow-xs ring-2 ring-[var(--primary)]/20'
                          : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center flex-shrink-0 text-xs ${
                          isSelected
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)]'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
              {/* Previous button */}
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="btn btn-secondary text-xs px-4 py-2 w-full sm:w-auto disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Sebelumnya</span>
              </button>

              {/* Doubt / Ragu-ragu Checkbox Toggle */}
              <button
                onClick={handleToggleMarked}
                className={`btn text-xs font-bold px-4 py-2 w-full sm:w-auto transition-all ${
                  currentAnswer.isMarked
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                <span>{currentAnswer.isMarked ? 'Ragu-ragu (Ditandai)' : 'Ragu-ragu'}</span>
              </button>

              {/* Next or Finish Button */}
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="btn btn-primary text-xs px-4 py-2 w-full sm:w-auto"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => setShowFinishModal(true)}
                  className="btn btn-primary text-xs px-4 py-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Selesai Ujian</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Grid Navigation (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="card p-4 space-y-4 sticky top-20 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Navigasi Soal ({questions.length})
              </span>
              <button
                onClick={() => setShowFinishModal(true)}
                className="btn btn-primary text-[10px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
              >
                Selesai Ujian
              </button>
            </div>

            {/* Status Legend (PRD Section 9.2) */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary)] pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-blue-600 inline-block"></span>
                <span>Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 inline-block"></span>
                <span>Ragu-ragu ({doubtCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[var(--bg-base)] border border-[var(--border)] inline-block"></span>
                <span>Belum ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm border-2 border-indigo-500 inline-block"></span>
                <span>Aktif</span>
              </div>
            </div>

            {/* Grid 1 to 110 */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q: any, idx: number) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isMarked = ans?.isMarked;
                const isAnswered = Boolean(ans?.selectedOptionId);

                let colorStyle = 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)]';

                if (isMarked) {
                  colorStyle = 'bg-amber-500 text-white font-bold border-amber-600';
                } else if (isAnswered) {
                  colorStyle = 'bg-blue-600 text-white font-bold border-blue-700';
                }

                if (isCurrent) {
                  colorStyle += ' ring-2 ring-indigo-500 ring-offset-1 scale-105';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${colorStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Question Grid Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-80 h-full bg-[var(--bg-surface)] p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-sm font-bold text-[var(--text-primary)]">
                Kisi-Kisi Soal ({questions.length})
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-card-hover)]"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q: any, idx: number) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isMarked = ans?.isMarked;
                const isAnswered = Boolean(ans?.selectedOptionId);

                let colorStyle = 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)]';
                if (isMarked) colorStyle = 'bg-amber-500 text-white font-bold';
                else if (isAnswered) colorStyle = 'bg-blue-600 text-white font-bold';
                if (isCurrent) colorStyle += ' ring-2 ring-indigo-500 scale-105';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobileDrawerOpen(false);
                    }}
                    className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center ${colorStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowFinishModal(true);
                }}
                className="btn btn-primary w-full text-xs font-bold py-2.5 bg-emerald-600 hover:bg-emerald-700"
              >
                Selesai & Kumpulkan Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Finish Exam Confirmation Modal (PRD Section 9.3) */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card p-6 sm:p-8 max-w-md w-full space-y-5 bg-[var(--bg-modal)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Konfirmasi Penyelesaian Ujian
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Pastikan Anda telah memeriksa kembali seluruh jawaban sebelum mengakhiri sesi simulasi ini.
              </p>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
              <div>
                <span className="text-base font-black text-blue-600">{answeredCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Terjawab</span>
              </div>
              <div>
                <span className="text-base font-black text-amber-500">{doubtCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Ragu-ragu</span>
              </div>
              <div>
                <span className="text-base font-black text-red-500">{unansweredCount}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Kosong</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Masih ada {unansweredCount} soal yang belum Anda jawab. Jawaban kosong mendapatkan nilai 0.</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                disabled={submitting}
                onClick={() => setShowFinishModal(false)}
                className="btn btn-secondary text-xs px-4"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmitExam}
                className="btn btn-primary text-xs px-5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    <span>Menghitung Nilai...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    <span>Kumpulkan Jawaban</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


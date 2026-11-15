'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Zap,
  Bookmark,
  Share2,
} from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/UIStates';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [material, setMaterial] = useState<any>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) fetchMaterialDetail();
  }, [id]);

  const fetchMaterialDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/materials/${id}`);
      if (!res.ok) throw new Error('Materi tidak ditemukan.');
      const data = await res.json();
      setMaterial(data.material);

      // Populate completed state from progress records
      const initialMap: Record<string, boolean> = {};
      if (Array.isArray(data.material.progress)) {
        data.material.progress.forEach((p: any) => {
          if (p.chapterId && p.isCompleted) {
            initialMap[p.chapterId] = true;
          }
        });
      }
      setCompletedChapters(initialMap);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapterCompleted = async (chapterId: string) => {
    const currentState = Boolean(completedChapters[chapterId]);
    const newState = !currentState;

    setCompletedChapters((prev) => ({ ...prev, [chapterId]: newState }));
    setSavingProgress(true);

    try {
      await fetch(`/api/materials/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          isCompleted: newState,
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) return <LoadingState message="Memuat materi dan bab pembelajaran..." />;
  if (!material) return <ErrorState message="Materi tidak ditemukan." onRetry={fetchMaterialDetail} />;

  const chapters = material.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || {
    title: material.title,
    content: material.content,
  };

  const isCurrentCompleted = Boolean(completedChapters[currentChapter.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <Link
          href="/materi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Materi</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="badge badge-primary text-[11px] font-bold">
            {material.category.code} • {material.subcategory?.name || 'Umum'}
          </span>
          <Link
            href={`/latihan?category=${material.category.code}`}
            className="btn btn-secondary text-xs py-1 px-3"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 mr-1" />
            <span>Latihan Soal Terkait</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar Chapters + Content Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Col: Chapter Navigation Drawer / Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Daftar Bab Pembelajaran
            </h3>

            <div className="space-y-1">
              {chapters.map((ch: any, idx: number) => {
                const isActive = idx === activeChapterIndex;
                const isDone = Boolean(completedChapters[ch.id]);

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="opacity-70 text-[10px]">{idx + 1}.</span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                    {isDone && (
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-emerald-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Reader Container */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6 sm:p-10 space-y-6 shadow-sm">
            {/* Title & Reading Meta */}
            <div className="border-b border-[var(--border)] pb-6 space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Bab {activeChapterIndex + 1} dari {chapters.length}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {currentChapter.title}
              </h1>
            </div>

            {/* Content Body formatted with RichContentRenderer */}
            <div className="prose max-w-none text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              <RichContentRenderer content={currentChapter.content} />
            </div>

            {/* Bottom Actions: Mark Completed + Next/Prev */}
            <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => toggleChapterCompleted(currentChapter.id)}
                disabled={savingProgress}
                className={`btn text-xs font-bold px-4 py-2 ${
                  isCurrentCompleted
                    ? 'btn-secondary text-emerald-600 border-emerald-500'
                    : 'btn-primary'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>{isCurrentCompleted ? 'Selesai Dipelajari (Klik untuk Batal)' : 'Tandai Bab Selesai'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeChapterIndex === 0}
                  onClick={() => setActiveChapterIndex(activeChapterIndex - 1)}
                  className="btn btn-secondary text-xs px-3 py-2 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Bab Sebelumnya</span>
                </button>
                <button
                  disabled={activeChapterIndex === chapters.length - 1}
                  onClick={() => setActiveChapterIndex(activeChapterIndex + 1)}
                  className="btn btn-secondary text-xs px-3 py-2 disabled:opacity-30"
                >
                  <span>Bab Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


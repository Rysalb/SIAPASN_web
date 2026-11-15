'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { LoadingState, ZeroSearchState } from '@/components/ui/UIStates';

export default function MaterialsPage() {
  const [data, setData] = useState<{ categories: any[]; materials: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [activeCategory]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const url = `/api/materials?category=${activeCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = (data?.materials || []).filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Modul Pembelajaran Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Ringkasan Materi Seleksi CPNS
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
          Pelajari konsep penting, rangkuman pasal UUD 1945, butir Pancasila, trik cepat TIU, dan panduan memilih jawaban berbobot 5 pada soal TKP.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            Semua Materi
          </button>
          <button
            onClick={() => setActiveCategory('TWK')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'TWK'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            TWK (Wawasan Kebangsaan)
          </button>
          <button
            onClick={() => setActiveCategory('TIU')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'TIU'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            TIU (Intelegensia Umum)
          </button>
          <button
            onClick={() => setActiveCategory('TKP')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'TKP'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            TKP (Karakteristik Pribadi)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi pembelajaran..."
            className="form-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <LoadingState message="Memuat materi belajar..." />
      ) : filteredMaterials.length === 0 ? (
        <ZeroSearchState
          query={searchQuery}
          onReset={() => {
            setActiveCategory('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => {
            const completedCount = Array.isArray(mat.progress)
              ? mat.progress.filter((p: any) => p.isCompleted).length
              : 0;
            const totalChapters = mat.chapters?.length || 1;
            const progressPercent = Math.round((completedCount / totalChapters) * 100);

            return (
              <div
                key={mat.id}
                className="card p-6 flex flex-col justify-between card-hoverable group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary text-[10px] font-bold">
                      {mat.category.code} • {mat.subcategory?.name || 'Umum'}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{mat.readTimeMinutes || 10} mnt baca</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                    {mat.description || 'Pelajari materi dasar dan butir kisi-kisi standar CAT CPNS.'}
                  </p>

                  {/* Chapters breakdown */}
                  <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      Daftar Bab ({mat.chapters?.length || 0}):
                    </span>
                    <ul className="space-y-1">
                      {mat.chapters?.slice(0, 3).map((ch: any) => (
                        <li key={ch.id} className="text-xs truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                          <span>{ch.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] mt-4">
                  {/* Progress bar if logged in */}
                  {mat.progress && (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] font-semibold text-[var(--text-muted)]">
                        <span>Progress Baca</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/materi/${mat.id}`}
                    className="btn btn-secondary w-full text-xs font-bold justify-between group-hover:bg-[var(--primary)] group-hover:text-white transition-all"
                  >
                    <span>Buka Materi</span>
                    <ChevronRight className="w-4 h-4" />
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


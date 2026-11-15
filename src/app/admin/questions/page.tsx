'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Add question modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    categoryId: '',
    subcategoryId: '',
    difficulty: 'MEDIUM',
    questionText: '',
    explanation: '',
    correctAnswerLabel: 'A',
    options: [
      { optionLabel: 'A', optionText: '', scoreWeight: 5 },
      { optionLabel: 'B', optionText: '', scoreWeight: 0 },
      { optionLabel: 'C', optionText: '', scoreWeight: 0 },
      { optionLabel: 'D', optionText: '', scoreWeight: 0 },
      { optionLabel: 'E', optionText: '', scoreWeight: 0 },
    ],
  });

  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/questions?category=${category}&difficulty=${difficulty}&search=${encodeURIComponent(
        search
      )}&page=${page}&limit=15`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions || []);
      setCategories(data.categories || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
      if (data.categories?.length > 0 && !newQuestion.categoryId) {
        setNewQuestion((prev) => ({ ...prev, categoryId: data.categories[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus butir soal ini dari bank soal?')) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      if (!res.ok) throw new Error('Gagal menambahkan soal.');
      setAddModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Bank Soal Seleksi CPNS
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Kelola {pagination.total} butir soal TWK, TIU, dan TKP yang tersedia dalam sistem.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="btn btn-primary text-xs py-2 px-3.5 shadow-sm bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Tambah Soal Manual</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs w-auto"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="TWK">TWK</option>
            <option value="TIU">TIU</option>
            <option value="TKP">TKP</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs w-auto"
          >
            <option value="ALL">Semua Kesulitan</option>
            <option value="EASY">Mudah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HARD">Sulit</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari teks soal / pembahasan..."
            className="form-input pl-9 text-xs"
          />
        </form>
      </div>

      {/* Questions List */}
      {loading ? (
        <LoadingState message="Memuat daftar soal..." />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Soal yang Ditemukan"
          description="Coba ubah kata kunci atau filter kategori Anda."
          actionLabel="Bersihkan Filter"
          onAction={() => {
            setCategory('ALL');
            setDifficulty('ALL');
            setSearch('');
            setPage(1);
          }}
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const correctOpt = q.options?.find((o: any) => o.isCorrect) || q.options?.[0];

            return (
              <div key={q.id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary text-[10px] font-bold">
                      {q.category?.code} • {q.subcategory?.name || 'Umum'}
                    </span>
                    <span className="badge badge-neutral text-[10px]">{q.difficulty}</span>
                    {q.document && (
                      <span className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">
                        Sumber: {q.document.filename}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Kunci: {correctOpt?.optionLabel}
                    </span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)]">
                  {q.options?.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'border-[var(--border)] bg-[var(--bg-base)]'
                      }`}
                    >
                      <span className="truncate">
                        <strong>{opt.optionLabel}.</strong> {opt.optionText}
                      </span>
                      {q.category?.code === 'TKP' && (
                        <span className="badge badge-primary text-[9px]">Poin: {opt.scoreWeight}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-[var(--text-muted)]">
              Halaman {page} dari {pagination.totalPages} ({pagination.total} total soal)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-secondary text-xs p-2 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-secondary text-xs p-2 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Question Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg-modal)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Tambah Butir Soal Baru Manual
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="btn btn-ghost text-xs">
                Tutup
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Kategori
                  </label>
                  <select
                    value={newQuestion.categoryId}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, categoryId: e.target.value })
                    }
                    className="form-select text-xs"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                    }
                    className="form-select text-xs"
                  >
                    <option value="EASY">Mudah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HARD">Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Teks Pertanyaan
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion.questionText}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, questionText: e.target.value })
                  }
                  placeholder="Tuliskan pertanyaan soal di sini..."
                  className="form-textarea text-xs"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Pilihan Jawaban (A - E) & Kunci Jawaban
                </label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={opt.optionLabel} className="flex items-center gap-2">
                    <span className="font-bold text-xs w-6">{opt.optionLabel}.</span>
                    <input
                      type="text"
                      required
                      value={opt.optionText}
                      onChange={(e) => {
                        const updated = [...newQuestion.options];
                        updated[idx].optionText = e.target.value;
                        setNewQuestion({ ...newQuestion, options: updated });
                      }}
                      placeholder={`Pilihan jawaban ${opt.optionLabel}...`}
                      className="form-input text-xs flex-1"
                    />
                    <input
                      type="radio"
                      name="correctRadio"
                      checked={newQuestion.correctAnswerLabel === opt.optionLabel}
                      onChange={() =>
                        setNewQuestion({ ...newQuestion, correctAnswerLabel: opt.optionLabel })
                      }
                      title="Jadikan sebagai Kunci Jawaban"
                      className="w-4 h-4 text-indigo-600"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Pembahasan
                </label>
                <textarea
                  rows={3}
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, explanation: e.target.value })
                  }
                  placeholder="Langkah penyelesaian dan penjelasan jawaban..."
                  className="form-textarea text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


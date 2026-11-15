'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Clock, Trash2, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [unusedCount, setUnusedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 100,
    examType: 'SKD_COMPLETE',
    isRandomized: true,
    passingGradeTwk: 65,
    passingGradeTiu: 80,
    passingGradeTkp: 166,
    sourceType: 'DOCUMENT', // 'DOCUMENT' | 'UNUSED' | 'ALL'
    sourceDocumentId: '',
  });

  const generateAutoDetails = (
    currentPackages: any[],
    currentDocs: any[],
    docId?: string,
    sourceType = 'DOCUMENT'
  ) => {
    const nextNum = currentPackages.length + 1;
    const selectedDoc = currentDocs.find((d) => d.id === docId) || currentDocs[0];

    let autoTitle = `Simulasi Resmi CAT SKD CPNS 2024/2025 - Paket ${nextNum}`;
    if (selectedDoc?.filename) {
      const match = selectedDoc.filename.match(/\((\d+)\)/);
      if (match) {
        autoTitle = `Simulasi Resmi CAT SKD CPNS 2024/2025 - Paket ${match[1]}`;
      }
    }

    let autoDesc = `Simulasi Seleksi Kompetensi Dasar (SKD) berbasis Computer Assisted Test (CAT) standar BKN dengan komposisi soal HOTS terbaru.`;
    if (sourceType === 'DOCUMENT' && selectedDoc?.filename) {
      autoDesc = `Simulasi Seleksi Kompetensi Dasar (SKD) CAT CPNS edisi resmi bersumber langsung dari berkas ${selectedDoc.filename} (${selectedDoc._count?.questions || 110} butir soal) lengkap dengan pembahasan standar BKN.`;
    } else if (sourceType === 'UNUSED') {
      autoDesc = `Paket simulasi tryout baru dengan kurasi butir soal fresh berstandar BKN yang belum pernah diujikan pada paket-paket sebelumnya.`;
    }

    return { autoTitle, autoDesc };
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      const loadedPackages = data.packages || [];
      const loadedDocs = data.documents || [];
      setPackages(loadedPackages);
      setAvailableDocs(loadedDocs);
      setUnusedCount(data.unusedQuestionsTotal || 0);

      if (loadedDocs.length > 0) {
        const defaultDoc = loadedDocs[0];
        const { autoTitle, autoDesc } = generateAutoDetails(
          loadedPackages,
          loadedDocs,
          defaultDoc.id,
          'DOCUMENT'
        );
        setFormData((prev) => ({
          ...prev,
          sourceDocumentId: prev.sourceDocumentId || defaultDoc.id,
          title: prev.title || autoTitle,
          description: prev.description || autoDesc,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    const defaultDoc = availableDocs[0];
    const { autoTitle, autoDesc } = generateAutoDetails(
      packages,
      availableDocs,
      defaultDoc?.id,
      formData.sourceType || 'DOCUMENT'
    );
    setFormData({
      title: autoTitle,
      description: autoDesc,
      durationMinutes: 100,
      examType: 'SKD_COMPLETE',
      isRandomized: true,
      passingGradeTwk: 65,
      passingGradeTiu: 80,
      passingGradeTkp: 166,
      sourceType: 'DOCUMENT',
      sourceDocumentId: defaultDoc?.id || '',
    });
    setCreateModalOpen(true);
  };

  const handleDocSelect = (docId: string) => {
    const { autoTitle, autoDesc } = generateAutoDetails(packages, availableDocs, docId, formData.sourceType);
    setFormData((prev) => ({
      ...prev,
      sourceDocumentId: docId,
      title: autoTitle,
      description: autoDesc,
    }));
  };

  const handleSourceTypeSelect = (type: string) => {
    const { autoTitle, autoDesc } = generateAutoDetails(packages, availableDocs, formData.sourceDocumentId, type);
    setFormData((prev) => ({
      ...prev,
      sourceType: type,
      title: autoTitle,
      description: autoDesc,
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket ujian ini?')) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPackages();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Gagal membuat paket tryout.');
      setCreateModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Paket Ujian & Simulasi Tryout
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Kelola paket simulasi CAT CPNS, durasi pengerjaan, dan ketentuan passing grade.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Buat Paket Tryout Baru</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Memuat paket ujian..." />
      ) : packages.length === 0 ? (
        <EmptyState
          title="Belum Ada Paket Ujian"
          description="Buat paket tryout pertama Anda dengan menekan tombol di atas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-primary text-[10px] uppercase font-bold">
                    {pkg.examType}
                  </span>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)]">{pkg.title}</h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {pkg.description || 'Simulasi ujian standar BKN.'}
                </p>

                <div className="border-t border-[var(--border)] pt-2 text-xs space-y-1 text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>Durasi:</span>
                    <strong>{pkg.durationMinutes} Menit</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Soal:</span>
                    <strong>{pkg._count?.questions || pkg.totalQuestions} Butir</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Grade:</span>
                    <strong>{pkg.passingGradeTwk} / {pkg.passingGradeTiu} / {pkg.passingGradeTkp}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Percobaan Ujian:</span>
                    <strong>{pkg._count?.attempts || 0} Kali</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-lg bg-[var(--bg-modal)] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Buat Paket Ujian Tryout Baru
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="btn btn-ghost text-xs">
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Judul Paket Tryout
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const { autoTitle } = generateAutoDetails(
                        packages,
                        availableDocs,
                        formData.sourceDocumentId,
                        formData.sourceType
                      );
                      setFormData((prev) => ({ ...prev, title: autoTitle }));
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Tryout Akbar CAT SKD CPNS 2024"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Deskripsi Paket
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const { autoDesc } = generateAutoDetails(
                        packages,
                        availableDocs,
                        formData.sourceDocumentId,
                        formData.sourceType
                      );
                      setFormData((prev) => ({ ...prev, description: autoDesc }));
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan singkat tentang paket ini..."
                  className="form-textarea text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Tipe Ujian
                  </label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="form-select text-xs"
                  >
                    <option value="SKD_COMPLETE">SKD Lengkap (TWK+TIU+TKP)</option>
                    <option value="TWK_DRILL">Drill TWK Saja</option>
                    <option value="TIU_DRILL">Drill TIU Saja</option>
                    <option value="TKP_DRILL">Drill TKP Saja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={180}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                    PG TWK
                  </label>
                  <input
                    type="number"
                    value={formData.passingGradeTwk}
                    onChange={(e) =>
                      setFormData({ ...formData, passingGradeTwk: parseFloat(e.target.value) })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                    PG TIU
                  </label>
                  <input
                    type="number"
                    value={formData.passingGradeTiu}
                    onChange={(e) =>
                      setFormData({ ...formData, passingGradeTiu: parseFloat(e.target.value) })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                    PG TKP
                  </label>
                  <input
                    type="number"
                    value={formData.passingGradeTkp}
                    onChange={(e) =>
                      setFormData({ ...formData, passingGradeTkp: parseFloat(e.target.value) })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Sumber Soal (Anti-Duplikat) */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Pilihan Sumber Soal (Jaminan Tidak Duplikat)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSourceTypeSelect('DOCUMENT')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      formData.sourceType === 'DOCUMENT'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span>📄 Dari Berkas Dokumen PDF</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-normal">
                      Seluruh soal dari berkas terpilih
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSourceTypeSelect('UNUSED')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      formData.sourceType === 'UNUSED'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✨ Soal Baru Saja</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-normal">
                      {unusedCount} butir belum terpakai di paket lain
                    </p>
                  </button>
                </div>

                {formData.sourceType === 'DOCUMENT' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-[var(--text-primary)]">
                      Pilih Berkas Dokumen PDF Sumber:
                    </label>
                    <select
                      value={formData.sourceDocumentId}
                      onChange={(e) => handleDocSelect(e.target.value)}
                      className="form-select text-xs"
                    >
                      {availableDocs.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.filename} ({doc._count?.questions || 0} Butir Soal)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Soal akan diambil berurutan persis sesuai nomor butir pada berkas dokumen ini.
                    </p>
                  </div>
                )}

                {formData.sourceType === 'UNUSED' && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                    🛡️ <strong>Jaminan Anti-Duplikat:</strong> Sistem hanya akan mengambil dari <strong>{unusedCount} butir soal baru</strong> yang belum pernah terpasang pada Paket 1 maupun Paket 2.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  {submitting ? 'Membuat...' : 'Buat Paket & Pilih Soal Otomatis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


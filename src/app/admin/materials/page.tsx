'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ChevronRight,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Check,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mode: 'MANUAL' or 'PDF'
  const [inputMode, setInputMode] = useState<'MANUAL' | 'PDF'>('PDF');

  // PDF Extraction states
  const [pdfSource, setPdfSource] = useState<'UPLOAD' | 'EXISTING'>('EXISTING');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [startPage, setStartPage] = useState<string>('');
  const [endPage, setEndPage] = useState<string>('');
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [extractErrorMsg, setExtractErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMaterial, setNewMaterial] = useState<{
    categoryId: string;
    documentId?: string | null;
    title: string;
    description: string;
    readTimeMinutes: number;
    chapters: { title: string; content: string }[];
  }>({
    categoryId: '',
    documentId: null,
    title: '',
    description: '',
    readTimeMinutes: 15,
    chapters: [{ title: 'Bab 1: Pendahuluan', content: '' }],
  });

  useEffect(() => {
    fetchMaterials();
    fetchDocuments();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/materials');
      const data = await res.json();
      setMaterials(data.materials || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0 && !newMaterial.categoryId) {
        setNewMaterial((prev) => ({ ...prev, categoryId: data.categories[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/pdf/list');
      const data = await res.json();
      if (data.documents?.length > 0) {
        setDocuments(data.documents);
        // Default to first available document that doesn't have materials created yet
        const firstAvailable = data.documents.find(
          (d: any) => (!d.materials || d.materials.length === 0) && (!d._count?.materials || d._count.materials === 0)
        );
        setSelectedDocId(firstAvailable ? firstAvailable.id : data.documents[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus modul materi pembelajaran ini?')) return;
    try {
      const res = await fetch(`/api/admin/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMaterials();
        fetchDocuments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper checks for duplicate prevention
  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const isSelectedDocUsed = Boolean(
    selectedDoc &&
      ((selectedDoc.materials && selectedDoc.materials.length > 0) ||
        (selectedDoc._count?.materials && selectedDoc._count.materials > 0))
  );

  const duplicateUploadedDoc = pdfFile
    ? documents.find(
        (d) =>
          d.filename.toLowerCase() === pdfFile.name.toLowerCase() &&
          ((d.materials && d.materials.length > 0) || (d._count?.materials && d._count.materials > 0))
      )
    : null;

  const isExtractionBlocked =
    pdfSource === 'UPLOAD'
      ? Boolean(!pdfFile || duplicateUploadedDoc)
      : Boolean(!selectedDocId || isSelectedDocUsed);

  // Group documents into Available and Already Used
  const availableDocs = documents.filter(
    (d) => (!d.materials || d.materials.length === 0) && (!d._count?.materials || d._count.materials === 0)
  );
  const usedDocs = documents.filter(
    (d) => (d.materials && d.materials.length > 0) || (d._count?.materials && d._count.materials > 0)
  );

  const handleExtractFromPdf = async () => {
    setExtracting(true);
    setExtractErrorMsg(null);
    setExtractSuccessMsg(null);

    try {
      let res: Response;

      if (pdfSource === 'UPLOAD') {
        if (!pdfFile) {
          throw new Error('Silakan pilih berkas PDF terlebih dahulu.');
        }

        if (duplicateUploadedDoc) {
          throw new Error(
            `Berkas "${pdfFile.name}" sudah pernah dibuatkan modul materi "${duplicateUploadedDoc.materials?.[0]?.title || ''}". Tidak dapat membuat materi ganda.`
          );
        }

        const formData = new FormData();
        formData.append('file', pdfFile);
        if (startPage) formData.append('startPage', startPage);
        if (endPage) formData.append('endPage', endPage);

        res = await fetch('/api/admin/materials/parse-pdf', {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!selectedDocId) {
          throw new Error('Silakan pilih dokumen PDF dari daftar.');
        }

        if (isSelectedDocUsed) {
          throw new Error(
            `Dokumen ini sudah pernah dibuat menjadi modul materi: "${selectedDoc?.materials?.[0]?.title || ''}". Tidak dapat diekstrak ulang.`
          );
        }

        res = await fetch('/api/admin/materials/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: selectedDocId,
            startPage: startPage ? parseInt(startPage) : undefined,
            endPage: endPage ? parseInt(endPage) : undefined,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengekstrak materi dari PDF.');
      }

      // Populate newMaterial with extracted data
      let targetCategoryId = newMaterial.categoryId;
      if (data.categoryId) {
        targetCategoryId = data.categoryId;
      } else if (categories.length > 0) {
        const found = categories.find((c) => c.code === data.categoryCode);
        if (found) targetCategoryId = found.id;
      }

      setNewMaterial({
        categoryId: targetCategoryId,
        documentId: data.documentId || null,
        title: data.title || '',
        description: data.description || '',
        readTimeMinutes: data.suggestedReadTime || 15,
        chapters:
          data.chapters?.map((ch: any) => ({
            title: ch.title,
            content: ch.content,
          })) || [{ title: 'Bab 1', content: '' }],
      });

      setExtractSuccessMsg(
        `✓ Berhasil mengekstrak ${data.chaptersCount} bab dari "${data.filename}". Silakan tinjau dan sesuaikan isi bab di bawah.`
      );
    } catch (err: any) {
      setExtractErrorMsg(err.message || 'Terjadi kesalahan saat memproses PDF.');
    } finally {
      setExtracting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan materi.');
      }

      setAddModalOpen(false);
      // Reset form
      setExtractSuccessMsg(null);
      setExtractErrorMsg(null);
      setPdfFile(null);
      setNewMaterial({
        categoryId: categories[0]?.id || '',
        documentId: null,
        title: '',
        description: '',
        readTimeMinutes: 15,
        chapters: [{ title: 'Bab 1: Pendahuluan', content: '' }],
      });
      fetchMaterials();
      fetchDocuments();
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
            Manajemen Materi Pembelajaran
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Kelola modul belajar, bab rangkuman materi, dan panduan subtes ASN.
          </p>
        </div>

        <button
          onClick={() => {
            setAddModalOpen(true);
            setExtractSuccessMsg(null);
            setExtractErrorMsg(null);
            fetchDocuments();
          }}
          className="btn btn-primary text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {loading ? (
        <LoadingState message="Memuat materi..." />
      ) : materials.length === 0 ? (
        <EmptyState
          title="Belum Ada Materi"
          description="Tambahkan materi pembelajaran baru secara manual atau ekstrak otomatis dari berkas PDF."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary text-[10px] font-bold">
                    {m.category?.code || 'SKD'} • {m.chapters?.length || 0} Bab
                  </span>
                  {m.document && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 truncate max-w-[180px]"
                      title={`Sumber: ${m.document.filename}`}
                    >
                      📄 {m.document.filename}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Hapus Materi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-[var(--text-primary)]">{m.title}</h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {m.description || 'Rangkuman kisi-kisi dan materi pembelajaran standar BKN.'}
              </p>

              <div className="pt-2 text-xs space-y-1 text-[var(--text-secondary)] border-t border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  Daftar Bab:
                </span>
                {m.chapters?.slice(0, 3).map((ch: any) => (
                  <p key={ch.id} className="truncate text-xs">
                    • {ch.title}
                  </p>
                ))}
                {(m.chapters?.length || 0) > 3 && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    +{m.chapters.length - 3} bab lainnya...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Material Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-3xl max-h-[92vh] flex flex-col bg-[var(--bg-modal)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header with Tabs */}
            <div className="p-4 sm:p-5 border-b border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Tambah Modul Materi Pembelajaran
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Gunakan ekstraksi cerdas dari berkas PDF atau masukkan secara manual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn btn-ghost text-xs"
                >
                  Tutup
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[var(--bg-base)] rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setInputMode('PDF')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    inputMode === 'PDF'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ekstrak Otomatis dari PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('MANUAL')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    inputMode === 'MANUAL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Input Manual</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* PDF Extraction Box (Shown when inputMode === 'PDF') */}
              {inputMode === 'PDF' && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Pilihan Sumber Berkas PDF Materi</span>
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Sistem mendeteksi judul, kategori, dan memecah bab secara otomatis. Berkas yang sudah dibuat materi otomatis dikunci agar tidak terjadi duplikasi.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setPdfSource('EXISTING');
                          setExtractErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          pdfSource === 'EXISTING'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
                        }`}
                      >
                        Pilih PDF yang Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfSource('UPLOAD');
                          setExtractErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          pdfSource === 'UPLOAD'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
                        }`}
                      >
                        Unggah Baru
                      </button>
                    </div>
                  </div>

                  {/* Selector: Choose from existing documents with lock indicators */}
                  {pdfSource === 'EXISTING' ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[var(--text-primary)]">
                        Pilih dari Berkas Dokumen PDF
                      </label>
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="form-select text-xs font-medium"
                      >
                        <optgroup label="✨ Berkas PDF Tersedia (Belum Pernah Dibuat Materi)">
                          {availableDocs.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              ✓ {doc.filename} ({doc.totalPages || 1} Halaman)
                            </option>
                          ))}
                          {availableDocs.length === 0 && (
                            <option disabled value="">
                              -- Semua dokumen saat ini sudah pernah dibuat materi --
                            </option>
                          )}
                        </optgroup>

                        {usedDocs.length > 0 && (
                          <optgroup label="🔒 Berkas Sudah Digunakan (Terkunci - Anti Duplikasi)">
                            {usedDocs.map((doc) => (
                              <option key={doc.id} value={doc.id} className="text-amber-600 dark:text-amber-400">
                                🔒 [Sudah Dibuat] {doc.filename} (Materi: {doc.materials?.[0]?.title || 'Telah Terdaftar'})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      {/* Lock Warning Banner if Selected Document is Already Used */}
                      {isSelectedDocUsed && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1">
                            <p className="font-bold">
                              Berkas PDF ini sudah pernah dibuat menjadi modul materi!
                            </p>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              Modul terkait:{' '}
                              <strong className="underline">
                                "{selectedDoc?.materials?.[0]?.title}"
                              </strong>
                              . Untuk mencegah terjadinya materi ganda (double), berkas ini tidak dapat diekstrak ulang. Silakan pilih berkas lain yang bertanda centang (✓).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Upload New PDF File with Instant Duplicate Check */
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-[var(--bg-card)] transition-all"
                      >
                        <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          {pdfFile ? pdfFile.name : 'Klik untuk memilih berkas PDF Materi'}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Format .pdf (Maks. 50 MB, berbasis teks digital)
                        </span>
                      </div>

                      {/* Warning if Uploaded File matches already-used document */}
                      {duplicateUploadedDoc && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1">
                            <p className="font-bold">
                              Berkas dengan nama ini sudah pernah dibuat menjadi materi!
                            </p>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              Modul terkait:{' '}
                              <strong className="underline">
                                "{duplicateUploadedDoc.materials?.[0]?.title}"
                              </strong>
                              . Silakan pilih berkas PDF lain untuk mencegah duplikasi.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Page Range Options (Optional) */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-indigo-200/50 dark:border-indigo-800/40">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">
                        Mulai Halaman (Opsional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Contoh: 10"
                        value={startPage}
                        onChange={(e) => setStartPage(e.target.value)}
                        className="form-input text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">
                        Sampai Halaman (Opsional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Contoh: 30"
                        value={endPage}
                        onChange={(e) => setEndPage(e.target.value)}
                        className="form-input text-xs py-1.5"
                      />
                    </div>
                  </div>

                  {/* Extract Button with Disabled Safeguard */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Rentang halaman sangat berguna untuk buku tebal (misal: hanya bab TWK).
                    </span>

                    <button
                      type="button"
                      disabled={extracting || isExtractionBlocked}
                      onClick={handleExtractFromPdf}
                      className="btn btn-primary text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {extracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengekstrak Teks & Bab...</span>
                        </>
                      ) : isExtractionBlocked && isSelectedDocUsed ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Berkas Terkunci (Sudah Ada)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mulai Ekstraksi PDF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Messages */}
                  {extractSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{extractSuccessMsg}</span>
                    </div>
                  )}

                  {extractErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{extractErrorMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Review / Manual Input */}
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                      Kategori Subtes ASN
                    </label>
                    <select
                      value={newMaterial.categoryId}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, categoryId: e.target.value })
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
                      Estimasi Waktu Baca (Menit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newMaterial.readTimeMinutes}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          readTimeMinutes: parseInt(e.target.value) || 10,
                        })
                      }
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Judul Modul Materi
                  </label>
                  <input
                    type="text"
                    required
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Contoh: Pemahaman 45 Butir Pengamalan Sila Pancasila"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    value={newMaterial.description}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, description: e.target.value })
                    }
                    placeholder="Penjelasan ringkas tentang modul materi ini..."
                    className="form-textarea text-xs"
                  />
                </div>

                {/* Chapters List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                    <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                      Daftar Bab Pembelajaran ({newMaterial.chapters.length} Bab)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewMaterial({
                          ...newMaterial,
                          chapters: [
                            ...newMaterial.chapters,
                            { title: `Bab ${newMaterial.chapters.length + 1}`, content: '' },
                          ],
                        })
                      }
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Bab Baru</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newMaterial.chapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/40 space-y-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={ch.title}
                            onChange={(e) => {
                              const updated = [...newMaterial.chapters];
                              updated[idx].title = e.target.value;
                              setNewMaterial({ ...newMaterial, chapters: updated });
                            }}
                            placeholder={`Judul Bab ${idx + 1}`}
                            className="form-input text-xs font-bold flex-1"
                          />
                          {newMaterial.chapters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newMaterial.chapters.filter((_, i) => i !== idx);
                                setNewMaterial({ ...newMaterial, chapters: updated });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                              title="Hapus Bab"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <textarea
                          required
                          rows={4}
                          value={ch.content}
                          onChange={(e) => {
                            const updated = [...newMaterial.chapters];
                            updated[idx].content = e.target.value;
                            setNewMaterial({ ...newMaterial, chapters: updated });
                          }}
                          placeholder="Isi teks bab materi pembelajaran (mendukung format markdown)..."
                          className="form-textarea text-xs leading-relaxed font-mono text-[12px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2.5">
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
                    className="btn btn-primary text-xs bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simpan & Publikasikan Materi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

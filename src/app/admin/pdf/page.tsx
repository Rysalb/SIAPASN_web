'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  Edit2,
  Layers,
  ArrowRight,
  Loader2,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/UIStates';

export default function AdminPdfManagementPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Record<number, boolean>>({});
  const [approving, setApproving] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    statusText: string;
  } | null>(null);

  // Edit modal inside preview
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/pdf/list');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses file PDF.');
      }

      setUploadSuccess(data.message || 'File PDF berhasil diekstrak.');
      setCurrentDocumentId(data.documentId);
      setExtractedQuestions(data.extractedQuestions || []);

      // Select all by default
      const selectMap: Record<number, boolean> = {};
      (data.extractedQuestions || []).forEach((_: any, idx: number) => {
        selectMap[idx] = true;
      });
      setSelectedQuestions(selectMap);
      setReviewModalOpen(true);

      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApproveImport = async () => {
    if (!currentDocumentId) return;

    const questionsToImport = extractedQuestions.filter((_, idx) => selectedQuestions[idx]);
    if (questionsToImport.length === 0) {
      alert('Pilih minimal satu soal untuk diimpor.');
      return;
    }

    setApproving(true);
    const BATCH_SIZE = 15;
    const total = questionsToImport.length;

    setImportProgress({
      current: 0,
      total,
      percentage: 0,
      statusText: `Menyiapkan proses impor 0 dari ${total} butir soal...`,
    });

    try {
      let processed = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = questionsToImport.slice(i, i + BATCH_SIZE);
        const isFirstBatch = i === 0;
        const isLastBatch = i + BATCH_SIZE >= total;

        setImportProgress({
          current: processed,
          total,
          percentage: Math.round((processed / total) * 100),
          statusText: `Menyimpan butir #${i + 1} s/d #${Math.min(i + BATCH_SIZE, total)} dari ${total}...`,
        });

        const res = await fetch('/api/admin/pdf/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: currentDocumentId,
            approvedQuestions: batch,
            isFirstBatch,
            isLastBatch,
            totalQuestions: total,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengimpor batch soal.');

        processed += batch.length;
        const pct = Math.round((processed / total) * 100);

        setImportProgress({
          current: processed,
          total,
          percentage: pct,
          statusText: isLastBatch
            ? 'Menyelesaikan verifikasi dokumen & bank soal...'
            : `Tersimpan ${processed} dari ${total} butir soal (${pct}%)...`,
        });
      }

      setImportProgress({
        current: total,
        total,
        percentage: 100,
        statusText: `Selesai! Seluruh ${total} butir soal berhasil diimpor ke Bank Soal.`,
      });

      setTimeout(() => {
        alert(`Berhasil! Seluruh ${total} butir soal telah berhasil diimpor ke Bank Soal.`);
        setReviewModalOpen(false);
        setImportProgress(null);
        fetchDocuments();
      }, 700);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mengimpor.');
    } finally {
      setApproving(false);
    }
  };

  const openDocumentReview = (doc: any) => {
    setCurrentDocumentId(doc.id);
    let parsed: any[] = [];
    try {
      parsed = doc.extractedData ? JSON.parse(doc.extractedData) : [];
    } catch (e) {
      parsed = [];
    }
    setExtractedQuestions(parsed);
    const selectMap: Record<number, boolean> = {};
    parsed.forEach((_: any, idx: number) => {
      selectMap[idx] = true;
    });
    setSelectedQuestions(selectMap);
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          Manajemen PDF & Ekstraksi Otomatis
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Unggah berkas PDF modul atau simulasi soal CPNS. Sistem akan mengekstrak struktur pertanyaan, opsi jawaban, kunci, dan pembahasan secara otomatis.
        </p>
      </div>

      {/* 1. Upload Card (Drag and Drop / File Select) */}
      <div className="card p-6 sm:p-8 space-y-4 border-dashed border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mx-auto mb-2">
          <FileUp className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Unggah Berkas PDF Baru
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Format yang didukung: <strong>.pdf</strong> dokumen teks soal TWK, TIU, TKP atau ringkasan materi.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 max-w-md mx-auto rounded-lg bg-[var(--error-light)] text-[var(--error)] text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 max-w-md mx-auto rounded-lg bg-[var(--success-light)] text-[var(--success-foreground)] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <div className="pt-2">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="pdf-upload-input"
          />
          <label
            htmlFor="pdf-upload-input"
            className={`btn btn-primary text-xs font-bold px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Mengekstrak Dokumen PDF...</span>
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-1.5" />
                <span>Pilih Berkas PDF untuk Diproses</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* 2. Documents History List (PRD Section 4.2 E & F) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          Daftar Dokumen PDF yang Diunggah
        </h2>

        {loading ? (
          <LoadingState message="Memuat daftar dokumen PDF..." />
        ) : documents.length === 0 ? (
          <EmptyState
            title="Belum Ada Dokumen"
            description="Silakan unggah berkas PDF pertama Anda melalui formulir di atas."
          />
        ) : (
          <div className="card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-base)] text-[var(--text-muted)] font-bold uppercase text-[10px] border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4">Nama Berkas</th>
                    <th className="py-3 px-4">Tipe & Halaman</th>
                    <th className="py-3 px-4">Ukuran</th>
                    <th className="py-3 px-4">Status Pemrosesan</th>
                    <th className="py-3 px-4">Tanggal Unggah</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)] font-medium">
                  {documents.map((doc) => {
                    let statusBadge = null;
                    if (doc.processingStatus === 'COMPLETED') {
                      statusBadge = <span className="badge badge-success text-[10px]">Telah Diimpor</span>;
                    } else if (doc.processingStatus === 'REVIEW') {
                      statusBadge = <span className="badge badge-warning text-[10px]">Perlu Validasi</span>;
                    } else if (doc.processingStatus === 'FAILED') {
                      statusBadge = <span className="badge badge-error text-[10px]">Gagal Ekstrak</span>;
                    } else {
                      statusBadge = <span className="badge badge-primary text-[10px]">{doc.processingStatus}</span>;
                    }

                    return (
                      <tr key={doc.id} className="hover:bg-[var(--bg-card-hover)]">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="truncate max-w-xs">{doc.filename}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {doc.documentType} • {doc.totalPages} Halaman
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="py-3 px-4">{statusBadge}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {doc.extractedData ? (
                            <button
                              onClick={() => openDocumentReview(doc)}
                              className="btn btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Soal</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. Review & Approval Modal (PRD Section 4.2 D) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-modal)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="badge badge-primary text-[10px] uppercase font-bold">
                  Preview Hasil Ekstraksi
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                  Validasi {extractedQuestions.length} Butir Soal Terdeteksi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={approving}
                  onClick={handleApproveImport}
                  className="btn btn-primary text-xs bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      <span>
                        Mengimpor... {importProgress ? `${importProgress.percentage}%` : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>Setujui & Impor ke Bank Soal</span>
                    </>
                  )}
                </button>
                <button
                  disabled={approving}
                  onClick={() => setReviewModalOpen(false)}
                  className="btn btn-secondary text-xs px-3"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Active Import Progress Indicator Banner */}
            {importProgress && (
              <div className="px-6 py-3.5 bg-indigo-50/90 dark:bg-indigo-950/50 border-b border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
                    <span>{importProgress.statusText}</span>
                  </div>
                  <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                    {importProgress.percentage}% ({importProgress.current}/{importProgress.total} Soal)
                  </span>
                </div>
                {/* Progress bar track & indicator */}
                <div className="w-full h-2 bg-indigo-200/60 dark:bg-indigo-900/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(importProgress.percentage, 3)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Questions Review List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {extractedQuestions.map((q, idx) => {
                const isChecked = selectedQuestions[idx] ?? true;

                return (
                  <div
                    key={idx}
                    className={`card p-4 space-y-3 transition-all ${
                      isChecked ? 'border-[var(--border)]' : 'opacity-40 bg-[var(--bg-base)]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSelectedQuestions((prev) => ({
                              ...prev,
                              [idx]: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                        <span className="text-xs font-black text-[var(--text-primary)]">
                          Soal #{q.number || idx + 1}
                        </span>
                        <span className="badge badge-primary text-[10px]">
                          {q.categoryCode} • {q.subcategoryName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Kunci: {q.correctAnswer}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt: any) => (
                        <div
                          key={opt.label}
                          className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                            opt.label === q.correctAnswer
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="font-bold">{opt.label}.</span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-[var(--bg-base)] text-[11px] text-[var(--text-muted)]">
                        <strong>Pembahasan:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


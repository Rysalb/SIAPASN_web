'use client';

import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  Loader2, 
  AlertTriangle, 
  WifiOff, 
  SearchX, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Clock
} from 'lucide-react';

/* 1. Empty State */
export function EmptyState({
  title = 'Belum Ada Data',
  description = 'Saat ini belum ada data yang tersimpan pada bagian ini.',
  actionLabel,
  onAction,
  icon,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center text-center p-8 sm:p-12 border-dashed border-2 my-4">
      <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-4 shadow-sm">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* 2. Loading State */
export function LoadingState({
  message = 'Memuat data sistem...',
  subtext = 'Mohon tunggu sebentar, kami sedang menyiapkan konten untuk Anda.',
}: {
  message?: string;
  subtext?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
        <div className="absolute inset-0 blur-sm rounded-full bg-[var(--primary)] opacity-20"></div>
      </div>
      <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">{message}</h4>
      <p className="text-xs text-[var(--text-muted)] max-w-xs">{subtext}</p>
    </div>
  );
}

/* 3. Error State */
export function ErrorState({
  title = 'Terjadi Kendala',
  message = 'Gagal memuat data. Silakan coba kembali beberapa saat lagi.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-6 sm:p-8 text-center border-[var(--error-light)] bg-[var(--error-light)]/20 my-4">
      <div className="w-12 h-12 rounded-full bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[var(--error-foreground)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Coba Lagi
        </button>
      )}
    </div>
  );
}

/* 4. Offline State (Auto listens to online/offline) */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-[var(--warning)] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Koneksi internet Anda terputus. Jawaban dan data ujian akan disimpan secara lokal.</span>
    </div>
  );
}

/* 5. Zero Search Results State */
export function ZeroSearchState({
  query,
  onReset,
}: {
  query?: string;
  onReset?: () => void;
}) {
  return (
    <div className="card p-8 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-muted)] flex items-center justify-center mx-auto mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
        Tidak Ditemukan Hasil Pencarian
      </h4>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-4">
        {query ? `Tidak ada data yang cocok dengan kata kunci "${query}".` : 'Coba gunakan kata kunci lain atau bersihkan filter.'}
      </p>
      {onReset && (
        <button onClick={onReset} className="btn btn-secondary text-xs">
          Reset Filter & Pencarian
        </button>
      )}
    </div>
  );
}

/* 6. Permission Denied State */
export function PermissionDeniedState({
  requiredRole = 'Administrator',
  onBack,
}: {
  requiredRole?: string;
  onBack?: () => void;
}) {
  return (
    <div className="card p-8 sm:p-12 text-center my-6 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Akses Ditolak</h3>
      <p className="text-xs text-[var(--text-muted)] mb-6">
        Halaman ini memerlukan hak akses tingkat <strong>{requiredRole}</strong>. Silakan hubungi pengelola sistem atau kembali ke dashboard Anda.
      </p>
      {onBack && (
        <button onClick={onBack} className="btn btn-primary">
          Kembali ke Dashboard
        </button>
      )}
    </div>
  );
}

/* 7. Inline Form Validation Error */
export function FormValidationError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] font-semibold text-[var(--error)] mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
      <span>{message}</span>
    </p>
  );
}

/* 8. Success State */
export function SuccessState({
  title = 'Berhasil Disimpan!',
  message = 'Data berhasil diproses ke dalam database SIAPASN.',
  actionLabel = 'Lanjutkan',
  onAction,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card p-8 text-center my-4 border-[var(--success-light)] bg-[var(--success-light)]/20">
      <div className="w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mb-5">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary text-xs inline-flex items-center gap-1.5">
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}


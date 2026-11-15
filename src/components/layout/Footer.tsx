import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { ShieldCheck, Heart, Award, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-surface)] transition-colors mt-auto text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Logo size="md" />
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Platform simulasi CAT CPNS & PPPK terpadu dengan sistem ekstraksi bank soal otomatis, pembahasan terstruktur, dan analitik performa berbasis kompetensi BKN.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="badge badge-primary text-[10px]">Standar SKD 110 Soal</span>
              <span className="badge badge-success text-[10px]">Auto-Save CAT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Fitur Pembelajaran
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/materi" className="hover:text-[var(--primary)] transition-colors">
                  Ringkasan Materi TWK, TIU, TKP
                </Link>
              </li>
              <li>
                <Link href="/latihan" className="hover:text-[var(--primary)] transition-colors">
                  Latihan Soal & Pembahasan Cepat
                </Link>
              </li>
              <li>
                <Link href="/tryout" className="hover:text-[var(--primary)] transition-colors">
                  Simulasi CAT Ujian Nasional
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[var(--primary)] transition-colors">
                  Peringkat & Nilai Tertinggi
                </Link>
              </li>
            </ul>
          </div>

          {/* Materi CPNS */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Kategori Seleksi
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="font-semibold text-[var(--text-primary)]">TWK:</span> Pancasila, UUD 1945, NKRI, Integritas
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">TIU:</span> Deret Angka, Silogisme, Analogi, Berhitung
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">TKP:</span> Pelayanan Publik, Anti Radikalisme, Jejaring
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">Passing Grade:</span> TWK (65), TIU (80), TKP (166)
              </li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Disclaimer Resmi</span>
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              SIAPASN adalah platform edukasi mandiri. Seluruh materi, simulasi tryout, dan passing grade disusun berdasarkan acuan PermenPAN-RB & kisi-kisi resmi BKN. Skor hasil simulasi ini bukan merupakan hasil seleksi resmi Badan Kepegawaian Negara.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>© 2026 SIAPASN – Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Privasi & Keamanan</span>
            <span>•</span>
            <span>Ketentuan Layanan</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Dibuat dengan Vibe Coding untuk Pejuang NIP Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  FileText,
  ChevronRight,
  Check,
  HelpCircle,
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 60; // Refresh every minute

export default async function HomePage() {
  const [totalQuestions, totalMaterials, examPackages] = await Promise.all([
    prisma.question.count(),
    prisma.material.count(),
    prisma.examPackage.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      include: { _count: { select: { questions: true } } },
    }),
  ]);

  const faqs = [
    {
      q: 'Apakah format simulasi ujian ini sesuai dengan tes CAT BKN sesungguhnya?',
      a: 'Ya, simulasi dirancang mengacu pada pedoman Computer Assisted Test (CAT) BKN dengan total 110 soal SKD (30 TWK, 35 TIU, 45 TKP), durasi 100 menit, navigasi nomor warna (biru, abu-abu, kuning), dan penyimpanan autosave otomatis.',
    },
    {
      q: 'Berapa passing grade (nilai ambang batas) yang digunakan di SIAPASN?',
      a: 'Kami mengadopsi standar resmi PermenPAN-RB terbaru: TWK minimal 65, TIU minimal 80, dan TKP minimal 166. Anda dinyatakan lulus tryout apabila memenuhi seluruh ambang batas tersebut.',
    },
    {
      q: 'Apakah saya bisa langsung melihat pembahasan soal setelah selesai tryout?',
      a: 'Tentu saja! Setelah menekan tombol Selesai Ujian, Anda langsung disajikan skor detail per kategori, status kelulusan, dan bedah pembahasan lengkap nomor 1 sampai 110.',
    },
    {
      q: 'Bagaimana sistem penilaian soal TKP?',
      a: 'Sesuai aturan BKN, soal TKP tidak memiliki jawaban salah bernilai 0. Kelima pilihan jawaban (A sampai E) memiliki bobot nilai bertingkat antara 1 hingga 5.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-base)]">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold mb-6 shadow-xs border border-[var(--primary)]/20 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Persiapan Seleksi CPNS & PPPK 2024/2025</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-main max-w-4xl mx-auto leading-tight sm:leading-none">
            Persiapkan Diri, Raih Mimpi <br className="hidden sm:inline" />
            Menjadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500">Aparatur Sipil Negara</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg text-sub max-w-2xl mx-auto leading-relaxed font-medium">
            Platform pembelajaran dan simulasi CAT BKN terintegrasi. Dilengkapi ribuan bank soal asli terverifikasi, materi pembelajaran berbab, dan evaluasi passing grade akurat.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tryout"
              className="btn btn-primary text-sm sm:text-base px-6 py-3 w-full sm:w-auto shadow-md font-bold"
            >
              <GraduationCap className="w-5 h-5 mr-1" />
              <span>Mulai Simulasi CAT Gratis</span>
            </Link>
            <Link
              href="/materi"
              className="btn btn-secondary text-sm sm:text-base px-6 py-3 w-full sm:w-auto font-bold"
            >
              <BookOpen className="w-5 h-5 mr-1" />
              <span>Pelajari Ringkasan Materi</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-extrabold text-main">{totalQuestions}+ Soal</p>
                <p className="text-[11px] text-mute font-medium">Bank Soal Terverifikasi</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-extrabold text-main">100 Menit</p>
                <p className="text-[11px] text-mute font-medium">Durasi Realistis CAT</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-extrabold text-main">PermenPAN</p>
                <p className="text-[11px] text-mute font-medium">Passing Grade Resmi</p>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-extrabold text-main">Auto-Save</p>
                <p className="text-[11px] text-mute font-medium">Integritas Jawaban</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES (PRD Section 1.2 & 21) */}
      <section className="py-16 md:py-24 bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Keunggulan SIAPASN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-main mt-2">
              Segala yang Anda Butuhkan untuk Lulus Ujian SKD
            </h2>
            <p className="text-sm text-sub mt-3 font-medium">
              Dirancang khusus menyamai sistem CAT BKN dan dilengkapi fitur pendukung belajar yang memudahkan Anda menguasai setiap subtes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card p-6 card-hoverable space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-main">
                Antarmuka CAT Presisi
              </h3>
              <p className="text-xs text-sub leading-relaxed font-medium">
                Tampilan ujian identik dengan CAT BKN: kisi-kisi nomor berwarna (biru untuk terjawab, kuning untuk ragu-ragu, abu-abu untuk belum dijawab), timer sinkron, dan autosave ke server.
              </p>
              <ul className="text-xs space-y-1.5 pt-2 text-sub font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Autosave setiap klik jawaban</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tahan refresh tanpa hilang waktu</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 card-hoverable space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-main">
                Materi Berbab & Drill Soal
              </h3>
              <p className="text-xs text-sub leading-relaxed font-medium">
                Pelajari rangkuman materi TWK, trik cepat TIU (deret, analogi, silogisme), dan formula meraih poin 5 pada TKP. Disertai mode latihan instan dengan pembahasan langsung.
              </p>
              <ul className="text-xs space-y-1.5 pt-2 text-sub font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tandai bab yang sudah dipelajari</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Simpan soal favorit / sulit</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 card-hoverable space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-main">
                Diagnostik Nilai & Passing Grade
              </h3>
              <p className="text-xs text-sub leading-relaxed font-medium">
                Evaluasi otomatis passing grade TWK (65), TIU (80), TKP (166). Dapatkan rekomendasi belajar cerdas yang mendeteksi subkategori mana yang masih perlu Anda perbaiki.
              </p>
              <ul className="text-xs space-y-1.5 pt-2 text-sub font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Analisis topik paling lemah</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Peringkat Leaderboard Nasional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PAKET TRYOUT TERSEDIA */}
      <section className="py-16 md:py-20 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Paket Simulasi CAT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-main mt-1">
                Pilih Paket Ujian Anda
              </h2>
            </div>
            <Link
              href="/tryout"
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Lihat Semua Paket</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {examPackages.map((pkg) => (
              <div key={pkg.id} className="card p-6 flex flex-col justify-between card-hoverable">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary text-[10px] uppercase font-bold">
                      {pkg.examType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-mute flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.durationMinutes} Menit</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-main line-clamp-2">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-sub line-clamp-3 font-medium">
                    {pkg.description || 'Simulasi ujian standar BKN dengan komposisi lengkap TWK, TIU, dan TKP.'}
                  </p>

                  <div className="border-t border-[var(--border)] pt-3 text-xs space-y-1">
                    <div className="flex justify-between text-sub">
                      <span>Total Soal:</span>
                      <span className="font-bold text-main">{pkg.totalQuestions} Butir</span>
                    </div>
                    <div className="flex justify-between text-sub">
                      <span>Passing Grade:</span>
                      <span className="font-bold text-main">TWK 65 | TIU 80 | TKP 166</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/tryout`}
                    className="btn btn-primary w-full text-xs font-bold justify-center"
                  >
                    <span>Kerjakan Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ALUR BELAJAR 4 LANGKAH */}
      <section className="py-16 md:py-20 bg-[var(--bg-base)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-main">
              Alur Sukses Tembus NIP di SIAPASN
            </h2>
            <p className="text-xs sm:text-sm text-sub mt-2 font-medium">
              Metode persiapan komprehensif dari dasar hingga siap tempur di ruang ujian.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-5 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h4 className="text-sm font-bold text-main">Baca Materi Inti</h4>
              <p className="text-xs text-sub font-medium">
                Kuasai konsep UUD 1945, butir Pancasila, trik deret angka, dan indikator TKP.
              </p>
            </div>

            <div className="card p-5 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h4 className="text-sm font-bold text-main">Latihan Drill Bebas</h4>
              <p className="text-xs text-sub font-medium">
                Latih kecepatan menjawab per kategori dengan pembahasan instan dan kunci teruji.
              </p>
            </div>

            <div className="card p-5 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <h4 className="text-sm font-bold text-main">Ikuti Tryout CAT</h4>
              <p className="text-xs text-sub font-medium">
                Simulasi kondisi riil 100 menit dengan tekanan waktu dan 110 butir soal SKD.
              </p>
            </div>

            <div className="card p-5 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <h4 className="text-sm font-bold text-main">Evaluasi & Bedah</h4>
              <p className="text-xs text-sub font-medium">
                Pantau passing grade, perbaiki titik lemah, dan amati lonjakan peringkat Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-16 md:py-20 bg-[var(--bg-surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-main">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-sub mt-1 font-medium">
              Informasi lengkap seputar sistem simulasi dan materi seleksi ASN.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card p-5 space-y-2">
                <h4 className="text-sm font-bold text-main flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-sub pl-6 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="py-14 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Siap Menjadi ASN & Mengabdi untuk Negeri?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto font-medium">
            Jangan tunda persiapan Anda. Setiap latihan meningkatkan peluang Anda melampaui passing grade dan meraih ranking teratas!
          </p>
          <div className="pt-2">
            <Link
              href="/tryout"
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:bg-amber-300 hover:text-blue-950 transition-all"
            >
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Ikuti Simulasi CAT Sekarang</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

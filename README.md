# SIAPASN - Platform Simulasi CAT & Pembelajaran Mandiri Calon ASN

<p align="center">
  <img src="public/logo.svg" alt="SIAPASN Logo" width="380" />
</p>

<p align="center">
  <strong>Persiapkan Diri, Raih Mimpi Menjadi Aparatur Sipil Negara</strong><br />
  Platform modern persiapan Seleksi CPNS & PPPK berbasis Computer Assisted Test (CAT) standar BKN dengan arsitektur hemat resource, performa tinggi, zero-query caching, dan integrasi penuh ke Supabase PostgreSQL.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-ISC-green?style=for-the-badge" alt="License" />
</p>

---

## 📑 Daftar Isi

- [Tentang Platform](#-tentang-platform)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Standar Penilaian CAT BKN](#-arsitektur--standar-penilaian-cat-bkn)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Akun Pengujian (Testing Credentials)](#-akun-pengujian-testing-credentials)
- [Struktur Direktori](#-struktur-direktori)
- [Panduan Deployment](#-panduan-deployment)
- [Lisensi](#-lisensi)

---

## 💡 Tentang Platform

**SIAPASN** dirancang untuk menghadirkan pengalaman simulasi ujian Seleksi Kompetensi Dasar (SKD) CPNS dan PPPK yang seotentik mungkin dengan sistem CAT resmi Badan Kepegawaian Negara (BKN). Platform ini menggabungkan simulasi ujian berdurasi nyata, modul belajar mandiri interaktif, ekstraksi bank soal otomatis dari dokumen PDF, analitik kelemahan kompetensi, hingga papan peringkat nasional secara real-time.

---

## ✨ Fitur Utama

### 🎓 1. Mesin Simulasi CAT BKN Standar PermenPAN-RB
- **Timer Countdown Real-Time:** Durasi 100 menit dengan indikator warna dinamis (normal, peringatan kuning, dan darurat merah).
- **110 Butir Soal Lengkap:** Komposisi resmi: **30 TWK**, **35 TIU**, dan **45 TKP**.
- **Kisi-kisi Matriks Soal Pintar:** Menampilkan status butir soal: *Terjawab (Hijau)*, *Ragu-ragu (Kuning)*, dan *Belum Dijawab (Abu-abu)*.
- **Evaluasi Passing Grade Otomatis:** Menilai kelulusan berdasarkan ambang batas resmi (TWK: 65, TIU: 80, TKP: 166, Skor Maksimal: 550).
- **Pembahasan Mendalam:** Kunci jawaban dan pembahasan rasional terperinci yang terbuka setelah ujian selesai dikirimkan.

### ⚡ 2. Arsitektur Efisiensi Tinggi (Zero-Query Client Cache)
- **IndexedDB Client Caching:** Seluruh snapshot butir soal di-cache langsung di peramban pengguna; navigasi antar-soal (klik nomor 1 s/d 110) **0 query ke database server** (*zero-query latency*).
- **Batch Autosave & Toleransi Offline:** Jawaban tersimpan otomatis di penyimpanan lokal sebelum dikirimkan ke server secara berkala. Jika koneksi internet terputus di tengah ujian, pengerjaan tidak akan hilang dan otomatis tersinkronisasi kembali saat terhubung.
- **Server-Side Scoring:** Kunci jawaban tidak pernah dibocorkan ke client saat ujian berlangsung demi menjaga integritas data dan mencegah manipulasi frontend.

### 📚 3. Modul Pembelajaran Mandiri & Latihan Kilat
- Materi komprehensif terstruktur per kompetensi: **Nasionalisme**, **Integritas**, **Bela Negara**, **Pilar Negara**, **Bahasa Indonesia**, **Penalaran Logis & Numerik**, hingga **Pelayanan Publik & Jejaring Kerja**.
- Sistem pelacakan progres belajar per bab dan fitur penandaan soal favorit.

### 📄 4. Mesin Ekstraksi Soal Otomatis dari PDF (Admin Engine)
- Mengonversi soal, opsi jawaban (A–E), kunci jawaban, dan pembahasan langsung dari dokumen PDF modul ujian secara otomatis.
- Dilengkapi antarmuka validasi pratinjau (*preview*) dengan **Real-Time Progress Bar** saat impor massal ke database.

### 🏆 5. Papan Peringkat Nasional (Live Leaderboard) & Analitik
- Papan peringkat real-time peserta tryout se-Indonesia.
- Analitik radar kompetensi yang memetakan bidang kelemahan (misal: perlu peningkatan di materi Silogisme atau TKP Orientasi Pelayanan).

### 🎨 6. Multi-Theme Dynamic Palette
- Tersedia 4 tema visual adaptif yang nyaman di mata:
  1. **Obsidian Slate** (Dark Modern)
  2. **Light Clean** (Minimalis Terang)
  3. **Aquamarine Navy** (Biru Korporat)
  4. **Emerald Forest** (Hijau Prestisius)
- 100% responsif pada layar Ponsel (Mobile Navigation Bar), Tablet, dan Desktop.

---

## 📐 Arsitektur & Standar Penilaian CAT BKN

Platform mengimplementasikan formula pembobotan resmi BKN:

| Kategori | Butir Soal | Sistem Penskoran | Passing Grade (Ambang Batas) | Skor Maksimal |
|:---|:---:|:---|:---:|:---:|
| **TWK** (Tes Wawasan Kebangsaan) | 30 Soal | Benar: **+5**, Salah/Kosong: **0** | **65** | 150 |
| **TIU** (Tes Inteligensi Umum) | 35 Soal | Benar: **+5**, Salah/Kosong: **0** | **80** | 175 |
| **TKP** (Tes Karakteristik Pribadi) | 45 Soal | Skala Nilai: **1 s/d 5**, Kosong: **0** | **166** | 225 |
| **TOTAL** | **110 Soal** | - | **311 (Kumulatif)** | **550** |

---

## 🛠️ Teknologi yang Digunakan

* **Frontend Framework:** Next.js 14 (App Router, Server & Client Components)
* **Bahasa Pemrograman:** TypeScript 5
* **Desain UI & Styling:** Tailwind CSS, Lucide React Icons, Canvas Confetti
* **Database & BaaS:** PostgreSQL via Supabase (Connection Pooling & SSL)
* **ORM:** Prisma ORM 5 (dengan schema indexing teroptimasi)
* **Client-Side Cache:** IndexedDB Browser API
* **Autentikasi & Sesi:** HTTP-Only Cookie JWT, Bcrypt Hashing, Role-Based Access Control (Admin & Peserta)
* **Engine Parsing PDF:** PDFParse Engine

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/Rysalb/SIAPASN_web.git
cd SIAPASN_web
```

### 2. Instalasi Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isikan variabel lingkungan sesuai akun Supabase Anda:
```env
# Koneksi Database Supabase (Transaction Pooler & Direct)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Keamanan Sesi JWT
JWT_SECRET="masukkan-rahasia-jwt-anda"

# Supabase API (Client & Auth)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR-ANON-KEY]"

# Konfigurasi Tampilan
NEXT_PUBLIC_APP_NAME="SIAPASN"
NEXT_PUBLIC_APP_TAGLINE="Persiapkan Diri, Raih Mimpi Menjadi ASN"
```

### 4. Sinkronisasi Database (Prisma)
Kirim skema Prisma ke database Supabase Anda:
```bash
npx prisma db push
```

### 5. Seeding Data Awal
Isi materi lengkap dan bank soal ke database:
```bash
# 1. Seeding akun default, kategori soal, dan paket ujian awal
node prisma/seed.js

# 2. Seeding modul materi belajar komprehensif (Nasionalisme, TIU, TKP)
node scripts/seed-rich-materials.js

# 3. Seeding butir bank soal tambahan
node scripts/seed-more.js
```

### 6. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🔐 Akun Pengujian (Testing Credentials)

Untuk keperluan pengujian lokal, akun berikut otomatis dibuat saat menjalankan script seed:

| Peran | Email | Password | Hak Akses |
|:---|:---|:---|:---|
| **Super Admin** | `superadmin@siapasn.id` | `password123` | Akses penuh dashboard admin, impor PDF, kelola materi, soal, paket, dan pengguna |
| **Admin Konten** | `admin@siapasn.id` | `password123` | Kelola modul soal dan materi |
| **Peserta Tryout** | `user@siapasn.id` | `password123` | Mengikuti tryout CAT BKN, latihan soal, melihat riwayat & leaderboard |

---

## 📁 Struktur Direktori

```
SIAPASN_web/
├── prisma/
│   ├── schema.prisma          # Skema database, relasi model, & indeks Prisma
│   └── seed.js                # Skrip seeder data awal dan akun pengujian
├── public/                    # Aset statis, ikon, dan logo vektor
├── scripts/
│   ├── enable-rls.js          # Skrip aktivasi Row-Level Security Supabase
│   ├── seed-more.js           # Seeder bank soal tambahan
│   └── seed-rich-materials.js # Seeder 14 modul materi belajar CPNS
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Panel admin (soal, paket, modul materi, parse PDF)
│   │   ├── api/               # API endpoint backend (auth, exam, admin, materials)
│   │   ├── dashboard/         # Dashboard utama peserta
│   │   ├── favorit/           # Halaman soal favorit peserta
│   │   ├── latihan/           # Mode latihan kilat per kategori
│   │   ├── leaderboard/       # Papan peringkat nasional real-time
│   │   ├── login/ & register/ # Autentikasi peserta & admin
│   │   ├── materi/            # Modul pembelajaran materi SKD
│   │   ├── profil/            # Profil dan ringkasan skor peserta
│   │   ├── riwayat/           # Riwayat ujian dan evaluasi passing grade
│   │   └── tryout/            # Engine ujian CAT BKN (100 menit countdown)
│   ├── components/            # Komponen modular UI (Navbar, MobileNav, ThemeSwitcher)
│   ├── lib/                   # Utility (IndexedDB caching, JWT Auth, Prisma client)
│   └── utils/                 # Supabase server & client helper
├── .env.example               # Contoh konfigurasi variabel lingkungan aman
├── .gitignore                 # Proteksi berkas sensitif dari repository
├── package.json
└── README.md
```

---

## 🚢 Panduan Deployment

Aplikasi ini dapat di-deploy secara instan ke **Vercel** atau platform hosting Node.js lainnya:

1. Buat project baru di [Vercel Dashboard](https://vercel.com).
2. Hubungkan dengan repositori GitHub: `Rysalb/SIAPASN_web`.
3. Di bagian **Environment Variables**, tambahkan seluruh variabel dari berkas `.env.local` (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, dsb).
4. Klik **Deploy**. Vercel akan otomatis membangun Next.js build dan aplikasi langsung aktif secara global.

---

## 📄 Lisensi

Hak Cipta © 2024 [SIAPASN](https://github.com/Rysalb/SIAPASN_web). Seluruh hak cipta dilindungi.  
Dikembangkan sebagai solusi teknologi persiapan Calon Aparatur Sipil Negara Republik Indonesia.

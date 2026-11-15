# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SIAPASN – Platform Simulasi Tes CPNS & Persiapan ASN

**Versi:** 1.0  
**Status:** Initial Product Specification  
**Platform:** Web Application (Responsive)  
**Frontend & Backend:** Next.js  
**Database:** PostgreSQL  menggunakan Supabase
**Bahasa:** Indonesia

---

# 1. PROJECT OVERVIEW

## 1.1 Nama Produk

**SIAPASN**

Tagline: *Persiapkan Diri, Raih Mimpi Menjadi ASN.*

SIAPASN merupakan platform pembelajaran dan simulasi seleksi CPNS/CASN berbasis web yang memungkinkan pengguna mempelajari materi, mengerjakan latihan soal, mengikuti tryout berbasis Computer Assisted Test (CAT), serta memantau perkembangan nilai mereka.

Platform memiliki dua jenis pengguna utama:

1. **Administrator:** Mengelola pengguna, materi, soal, PDF, paket ujian, dan laporan.
2. **Peserta (User):** Mengakses materi, mengerjakan latihan soal, mengikuti simulasi ujian, dan melihat hasil evaluasi.

## 1.2 Tujuan Produk

- Menyediakan platform simulasi tes CPNS yang mudah digunakan.
- Mengotomatisasi pengelolaan soal dan materi melalui upload PDF.
- Menghadirkan pengalaman ujian yang menyerupai sistem CAT.
- Menyediakan evaluasi kemampuan peserta secara terukur.
- Mempermudah administrator memperbarui database soal tanpa input manual.
- Menyediakan sistem yang scalable untuk pengembangan bisnis edukasi digital.

## 1.3 Target Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Administrator | Mengelola seluruh konten dan sistem |
| Peserta CPNS | Belajar dan latihan soal |
| Peserta Tryout | Mengikuti simulasi ujian |
| Super Admin | Mengelola administrator dan konfigurasi sistem |

---

# 2. TECH STACK RECOMMENDATION

Arsitektur yang direkomendasikan menggunakan Next.js sebagai fondasi aplikasi dengan PostgreSQL sebagai database utama.

## 2.1 Teknologi Utama

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Frontend | Next.js (App Router) | Framework aplikasi |
| Backend | Next.js Server Actions & Route Handlers | API dan business logic |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Styling UI |
| UI Components | shadcn/ui | Komponen antarmuka |
| Database | PostgreSQL | Penyimpanan data |
| ORM | Prisma ORM | Komunikasi database |
| Authentication | Auth.js | Login dan autentikasi |
| File Storage | Cloudflare R2 | Penyimpanan PDF |
| PDF Parsing | Python + PyMuPDF | Ekstraksi konten PDF |
| OCR | PaddleOCR | Membaca PDF hasil scan |
| Background Jobs | Inngest | Pemrosesan PDF secara asynchronous |
| Validation | Zod | Validasi data |
| Charts | Recharts | Grafik perkembangan nilai |
| Deployment | Vercel | Hosting Next.js |
| Monitoring | Sentry | Error monitoring |

## 2.2 Rekomendasi Infrastruktur

**Frontend dan aplikasi utama**
- Next.js App Router.
- Deploy di Vercel.
- Gunakan Server Components untuk halaman yang tidak memerlukan interaksi client.
- Gunakan Client Components untuk ujian interaktif dan dashboard.

**Database**
- PostgreSQL managed database.
- Rekomendasi: Supabase PostgreSQL atau Neon.
- Prisma ORM sebagai penghubung database.

**Penyimpanan file**
- Cloudflare R2 untuk file PDF.
- Simpan file asli agar bisa diproses kembali.
- Database hanya menyimpan metadata, status pemrosesan, dan referensi file.

**PDF Processing Service**
- Python FastAPI sebagai service khusus untuk membaca PDF.
- PyMuPDF untuk ekstraksi teks.
- PaddleOCR untuk PDF yang berasal dari hasil scan.
- Inngest untuk menjalankan proses impor secara asynchronous.

Catatan: Next.js tidak harus menangani seluruh proses parsing PDF secara langsung. Pemisahan PDF Processing Service akan membuat aplikasi utama lebih ringan dan mudah dikembangkan.

---

# 3. USER ROLE & PERMISSION

## 3.1 Super Admin

Memiliki akses penuh terhadap sistem.

Hak akses:
- Mengelola administrator.
- Membuat dan menonaktifkan akun admin.
- Mengelola seluruh materi dan soal.
- Mengelola paket ujian.
- Melihat seluruh aktivitas peserta.
- Melihat laporan dan statistik sistem.
- Mengatur konfigurasi aplikasi.

## 3.2 Administrator

Hak akses:
- Upload PDF materi.
- Upload PDF soal.
- Memproses dan memvalidasi hasil ekstraksi PDF.
- Mengedit soal dan jawaban.
- Mengelola kategori soal.
- Membuat paket latihan dan tryout.
- Mengelola materi pembelajaran.
- Melihat statistik peserta.

## 3.3 Peserta

Hak akses:
- Registrasi dan login.
- Mengakses dashboard.
- Membaca materi.
- Mengerjakan latihan soal.
- Mengikuti simulasi CAT.
- Melihat hasil ujian.
- Melihat riwayat ujian.
- Melihat perkembangan nilai.
- Mengakses leaderboard jika diaktifkan.

---

# 4. ADMIN DASHBOARD

Dashboard admin merupakan pusat pengelolaan seluruh konten SIAPASN.

## 4.1 Dashboard Overview

Menampilkan informasi:

- Total pengguna terdaftar.
- Total soal dalam database.
- Total materi pembelajaran.
- Total paket tryout.
- Total ujian yang telah diselesaikan.
- Total file PDF yang diunggah.
- Jumlah PDF yang berhasil diproses.
- Jumlah PDF yang membutuhkan validasi.

## 4.2 Manajemen PDF (Fitur Utama)

Fitur ini menjadi salah satu keunggulan utama SIAPASN.

Administrator dapat menambahkan soal dan materi cukup melalui upload PDF.

### A. Upload PDF

Fitur upload harus mendukung:

- Drag and drop file.
- Multiple PDF upload.
- Progress upload.
- Informasi nama file.
- Ukuran file.
- Jumlah halaman.
- Tanggal upload.
- Pengguna yang mengunggah.
- Status pemrosesan.

Jenis dokumen:

1. PDF Materi TWK.
2. PDF Materi TIU.
3. PDF Materi TKP.
4. PDF Bank Soal TWK.
5. PDF Bank Soal TIU.
6. PDF Bank Soal TKP.
7. PDF Pembahasan Soal.
8. PDF kategori lainnya.

### B. Alur Pemrosesan PDF

Sistem harus mempunyai pipeline pemrosesan otomatis.

Alur:

1. Admin mengunggah PDF.
2. Sistem memvalidasi format dan ukuran file.
3. File disimpan di Cloudflare R2.
4. Sistem membuat job pemrosesan.
5. PDF Processing Service membaca isi dokumen.
6. Sistem mendeteksi apakah dokumen berupa materi atau kumpulan soal.
7. Sistem mengekstrak teks, gambar, tabel, pilihan jawaban, dan pembahasan.
8. Sistem mengidentifikasi kategori TWK, TIU, atau TKP.
9. Sistem menyusun data menjadi struktur soal atau materi.
10. Admin mendapatkan hasil ekstraksi.
11. Admin melakukan preview dan validasi.
12. Admin menyetujui hasil impor.
13. Data dimasukkan ke database SIAPASN.

### C. PDF Parsing Engine

Sistem harus mampu mengenali pola soal seperti:

Contoh dokumen:

**SOAL 1**

Pancasila sebagai dasar negara Indonesia disahkan pada tanggal?

A. 1 Juni 1945  
B. 22 Juni 1945  
C. 18 Agustus 1945  
D. 17 Agustus 1945  
E. 20 Mei 1908

**Kunci Jawaban: C**

**Pembahasan:** Pancasila disahkan sebagai dasar negara pada tanggal 18 Agustus 1945.

Hasil ekstraksi harus dikonversi menjadi struktur:

- Question
- Option A
- Option B
- Option C
- Option D
- Option E
- Correct Answer
- Explanation
- Category
- Difficulty
- Source PDF
- Page Number

Sistem tidak boleh menganggap seluruh format PDF selalu sama. Parsing harus menggunakan sistem deteksi pola, dan hasil yang tidak dikenali harus masuk ke daftar validasi manual.

### D. Preview Hasil Ekstraksi

Sebelum masuk database, admin harus bisa melihat hasil ekstraksi.

Fitur:
- Preview soal.
- Preview pilihan jawaban.
- Preview kunci jawaban.
- Preview pembahasan.
- Edit hasil ekstraksi.
- Hapus soal yang tidak relevan.
- Tandai soal duplikat.
- Ubah kategori soal.
- Pilih semua soal.
- Approve dan import.

### E. Status Pemrosesan

Status yang tersedia:

| Status | Keterangan |
|---|---|
| Uploaded | File berhasil diunggah |
| Queued | Menunggu proses |
| Processing | Sedang diproses |
| Review | Menunggu validasi admin |
| Completed | Berhasil diimpor |
| Failed | Gagal diproses |
| Rejected | Ditolak admin |

### F. Fitur Tambahan PDF

- Melihat riwayat upload.
- Mengunduh PDF asli.
- Memproses ulang file.
- Melihat pesan error.
- Melihat jumlah soal berhasil diekstrak.
- Melihat jumlah soal gagal diekstrak.
- Mencegah impor ganda.
- Menghapus data hasil impor sesuai permission.

**Catatan penting:** Kunci jawaban harus diverifikasi sebelum soal dipublikasikan. Jangan mengandalkan hasil OCR atau ekstraksi otomatis tanpa validasi.

---

# 5. MANAJEMEN BANK SOAL

Admin dapat mengelola seluruh soal yang sudah masuk database.

## 5.1 Kategori Soal

### TWK – Tes Wawasan Kebangsaan

Subkategori:
- Pancasila.
- UUD 1945.
- NKRI.
- Bhinneka Tunggal Ika.
- Nasionalisme.
- Integritas.
- Bela Negara.
- Pilar Kebangsaan.

### TIU – Tes Intelegensia Umum

Subkategori:
- Kemampuan Verbal.
- Analogi.
- Silogisme.
- Analitis.
- Numerik.
- Deret Angka.
- Aritmetika.
- Kemampuan Figural.

### TKP – Tes Karakteristik Pribadi

Subkategori:
- Pelayanan Publik.
- Jejaring Kerja.
- Sosial Budaya.
- Teknologi Informasi.
- Profesionalisme.
- Anti Radikalisme.

Kategori dan subkategori harus dapat ditambah atau diubah oleh administrator.

## 5.2 Fitur Bank Soal

- Tambah soal manual.
- Edit soal.
- Hapus soal.
- Pencarian soal.
- Filter kategori.
- Filter tingkat kesulitan.
- Filter sumber PDF.
- Melihat pembahasan.
- Melihat statistik soal.
- Import soal dari PDF.
- Export soal ke CSV atau Excel.

## 5.3 Format Data Soal

Setiap soal harus memiliki:

| Field | Keterangan |
|---|---|
| ID | Identitas soal |
| Question | Isi pertanyaan |
| Image | Gambar pendukung jika ada |
| Category | TWK/TIU/TKP |
| Subcategory | Kategori spesifik |
| Difficulty | Easy/Medium/Hard |
| Option A-E | Pilihan jawaban |
| Correct Answer | Kunci jawaban |
| Explanation | Pembahasan |
| Source PDF | Referensi dokumen |
| Source Page | Nomor halaman |
| Status | Draft/Published |

Untuk soal TKP, sistem harus mendukung lima pilihan jawaban dengan bobot nilai berbeda, bukan sekadar satu jawaban benar.

---

# 6. MANAJEMEN MATERI PEMBELAJARAN

Admin dapat menambahkan materi melalui PDF maupun input manual.

## 6.1 Fitur Materi

- Upload PDF materi.
- Ekstraksi teks otomatis.
- Kategorisasi materi.
- Preview materi.
- Edit materi.
- Publikasi materi.
- Mengatur urutan bab.
- Menambahkan gambar.
- Menambahkan file pendukung.

## 6.2 Struktur Materi

Contoh:

TWK
- Pancasila
  - Sejarah Pancasila
  - Nilai-nilai Pancasila
  - Pancasila sebagai Ideologi
- UUD 1945
  - Sejarah UUD 1945
  - Pasal-pasal UUD 1945
- NKRI
  - Sejarah Kemerdekaan
  - Sistem Pemerintahan

TIU
- Kemampuan Verbal
- Kemampuan Numerik
- Kemampuan Figural

TKP
- Pelayanan Publik
- Jejaring Kerja
- Sosial Budaya

Materi harus memiliki struktur bab dan subbab sehingga peserta dapat belajar secara sistematis.

---

# 7. PAKET UJIAN & TRYOUT

Administrator dapat membuat paket ujian berdasarkan bank soal.

## 7.1 Fitur Pembuatan Paket

Field paket ujian:

- Nama paket.
- Deskripsi.
- Kategori ujian.
- Total soal.
- Durasi ujian.
- Tanggal mulai.
- Tanggal berakhir.
- Status publikasi.
- Pengacakan soal.
- Pengacakan pilihan jawaban.
- Batas jumlah percobaan.
- Pengaturan pembahasan.

## 7.2 Jenis Ujian

1. Latihan per kategori.
2. Latihan per subkategori.
3. Tryout SKD lengkap.
4. Tryout khusus TWK.
5. Tryout khusus TIU.
6. Tryout khusus TKP.
7. Ujian bebas berdasarkan pilihan peserta.

## 7.3 Pengambilan Soal

Sistem dapat mengambil soal secara acak dari bank soal berdasarkan:

- Kategori.
- Subkategori.
- Tingkat kesulitan.
- Jumlah soal yang ditentukan.
- Ketersediaan soal.

Setiap percobaan harus menyimpan snapshot soal dan jawaban agar perubahan bank soal tidak mengubah riwayat ujian yang sudah dikerjakan.

---

# 8. USER DASHBOARD

Dashboard peserta harus memiliki tampilan modern, sederhana, dan mudah dipahami.

## 8.1 Dashboard Overview

Informasi yang ditampilkan:

- Nama peserta.
- Total ujian yang diikuti.
- Total latihan soal.
- Nilai tertinggi.
- Rata-rata nilai.
- Persentase perkembangan.
- Rekomendasi materi.
- Tryout terbaru.

## 8.2 Menu Peserta

1. Dashboard.
2. Materi Belajar.
3. Latihan Soal.
4. Simulasi CAT.
5. Hasil Ujian.
6. Riwayat Ujian.
7. Leaderboard.
8. Profil Saya.

## 8.3 Materi Belajar

Fitur:
- Kategori TWK, TIU, TKP.
- Daftar bab dan subbab.
- Baca materi.
- Progress belajar.
- Penanda materi selesai.
- Pencarian materi.

## 8.4 Latihan Soal

Fitur:
- Pilih kategori.
- Pilih subkategori.
- Tentukan jumlah soal.
- Tentukan tingkat kesulitan.
- Kerjakan soal.
- Lihat jawaban benar.
- Lihat pembahasan.
- Simpan soal favorit.
- Ulangi latihan.

Pada mode latihan, peserta boleh langsung melihat pembahasan setelah menjawab.

---

# 9. SIMULASI CAT CPNS

Ini merupakan fitur utama yang harus memberikan pengalaman seperti ujian CAT.

## 9.1 Tampilan Ujian

Layout ujian harus memuat:

- Header nama ujian.
- Countdown timer.
- Nomor soal.
- Pertanyaan.
- Pilihan jawaban.
- Navigasi nomor soal.
- Tombol sebelumnya.
- Tombol selanjutnya.
- Tombol ragu-ragu.
- Tombol selesai ujian.

## 9.2 Navigasi Soal

Warna status nomor soal:

- Abu-abu: Belum dijawab.
- Biru: Sudah dijawab.
- Kuning: Ragu-ragu.
- Warna khusus: Soal yang sedang dibuka.

## 9.3 Timer

- Timer berjalan otomatis.
- Waktu tersimpan pada server.
- Refresh halaman tidak mereset waktu.
- Ketika waktu habis, ujian otomatis diselesaikan.
- Peserta mendapatkan konfirmasi sebelum submit manual.

## 9.4 Penyimpanan Jawaban

- Jawaban otomatis tersimpan.
- Autosave setiap perubahan jawaban.
- Jawaban tetap tersedia ketika halaman direfresh.
- Sinkronisasi status jawaban.
- Penanganan koneksi terputus.
- Mencegah pengiriman jawaban ganda.

## 9.5 Keamanan Ujian

- Validasi waktu menggunakan server.
- Satu sesi ujian aktif sesuai kebijakan.
- Token sesi ujian.
- Mencegah manipulasi nilai dari browser.
- Validasi jawaban di backend.
- Rate limiting untuk endpoint ujian.
- Log aktivitas ujian.

Perlu dipahami bahwa aplikasi web tidak dapat sepenuhnya mencegah peserta menggunakan perangkat lain atau mencari jawaban di luar aplikasi. Fokus keamanan adalah menjaga integritas jawaban, durasi, dan hasil ujian.

---

# 10. SISTEM PENILAIAN

Sistem penilaian harus mengikuti konfigurasi dan ketentuan seleksi yang dijadikan referensi.

Untuk simulasi SKD, sistem harus mendukung konfigurasi:

- Jumlah soal TWK.
- Jumlah soal TIU.
- Jumlah soal TKP.
- Bobot nilai TWK.
- Bobot nilai TIU.
- Bobot nilai TKP.
- Passing grade setiap kategori.
- Total nilai maksimal.

Nilai harus dapat dikonfigurasi administrator karena ketentuan seleksi dapat berubah setiap periode.

## 10.1 Penilaian TWK dan TIU

Menggunakan sistem:
- Jawaban benar mendapatkan nilai sesuai konfigurasi.
- Jawaban salah mendapatkan nilai 0.
- Tidak dijawab mendapatkan nilai 0.

## 10.2 Penilaian TKP

Setiap pilihan jawaban memiliki bobot nilai tersendiri.

Contoh ilustrasi:

| Pilihan | Bobot |
|---|---:|
| A | 5 |
| B | 4 |
| C | 3 |
| D | 2 |
| E | 1 |

Bobot tersebut hanya contoh dan harus dapat diatur berdasarkan referensi penilaian yang digunakan.

## 10.3 Hasil Ujian

Setelah ujian selesai, tampilkan:

- Total nilai.
- Nilai TWK.
- Nilai TIU.
- Nilai TKP.
- Jumlah jawaban benar.
- Jumlah jawaban salah.
- Jumlah tidak dijawab.
- Status memenuhi atau belum memenuhi passing grade simulasi.
- Persentase pencapaian.
- Rekomendasi materi untuk dipelajari.

Hasil simulasi harus diberi keterangan bahwa nilai bukan hasil resmi seleksi BKN.

---

# 11. RIWAYAT DAN ANALISIS NILAI

Peserta dapat melihat perkembangan hasil ujian dari waktu ke waktu.

Fitur:
- Riwayat tryout.
- Tanggal pengerjaan.
- Nama paket ujian.
- Nilai keseluruhan.
- Nilai TWK, TIU, TKP.
- Grafik perkembangan.
- Nilai tertinggi.
- Nilai rata-rata.
- Kategori yang masih lemah.

Contoh analisis:

"Nilai TIU kamu masih berada di bawah target simulasi. Disarankan memperbanyak latihan numerik dan kemampuan verbal."

---

# 12. LEADERBOARD

Fitur leaderboard digunakan untuk meningkatkan motivasi peserta.

Informasi:
- Ranking peserta.
- Nama peserta.
- Nilai tryout.
- Jumlah ujian.
- Periode ranking.

Leaderboard dapat diatur berdasarkan:
- Harian.
- Mingguan.
- Bulanan.
- Keseluruhan.

Privasi peserta harus diperhatikan. Peserta dapat memilih nama tampilan atau menggunakan username.

---

# 13. DATABASE DESIGN

Database menggunakan PostgreSQL.

Berikut rancangan tabel inti.

## 13.1 Authentication & User

**users**
- id
- name
- email
- password_hash
- role
- avatar
- is_active
- created_at
- updated_at

**user_profiles**
- id
- user_id
- phone
- province
- education_level
- created_at

## 13.2 PDF Management

**documents**
- id
- filename
- storage_path
- file_size
- total_pages
- document_type
- uploaded_by
- processing_status
- processing_error
- created_at
- processed_at

**document_imports**
- id
- document_id
- total_extracted
- total_success
- total_failed
- total_approved
- import_status
- created_at

## 13.3 Question Management

**categories**
- id
- name
- description

**subcategories**
- id
- category_id
- name

**questions**
- id
- category_id
- subcategory_id
- document_id
- source_page
- question_text
- question_image
- explanation
- difficulty
- status
- created_at
- updated_at

**question_options**
- id
- question_id
- option_label
- option_text
- score_weight

**question_answers**
- id
- question_id
- correct_option_id

## 13.4 Learning Materials

**materials**
- id
- title
- category_id
- document_id
- description
- content
- status
- created_at

**material_chapters**
- id
- material_id
- title
- content
- order_number

**material_progress**
- id
- user_id
- chapter_id
- is_completed
- completed_at

## 13.5 Examination

**exam_packages**
- id
- title
- description
- duration_minutes
- exam_type
- total_questions
- is_randomized
- start_at
- end_at
- status
- created_at

**exam_package_questions**
- id
- exam_package_id
- question_id
- order_number

**exam_attempts**
- id
- user_id
- exam_package_id
- started_at
- ended_at
- expires_at
- status
- total_score
- created_at

**exam_attempt_questions**
- id
- attempt_id
- question_id
- question_snapshot
- order_number

**exam_answers**
- id
- attempt_id
- question_id
- selected_option_id
- is_marked
- answered_at

**exam_results**
- id
- attempt_id
- twk_score
- tiu_score
- tkp_score
- total_score
- correct_count
- incorrect_count
- unanswered_count
- created_at

## 13.6 Additional Tables

- user_favorites
- user_notifications
- leaderboard
- system_settings
- audit_logs
- exam_score_configs
- question_tags

Relasi database harus menggunakan foreign key, index, dan constraint yang sesuai. Gunakan UUID sebagai primary key agar identitas data tidak mudah ditebak.

---

# 14. SYSTEM ARCHITECTURE

Arsitektur sistem:

```text
                 SIAPASN
                    |
             NEXT.JS APPLICATION
                    |
        +-----------+-----------+
        |                       |
    ADMIN PANEL              USER PANEL
        |                       |
        +-----------+-----------+
                    |
              APPLICATION API
                    |
        +-----------+-----------+
        |           |           |
   PostgreSQL   Cloudflare R2  Auth
        |           |
        |        PDF Storage
        |           |
        |      Inngest Queue
        |           |
        |      Python Service
        |           |
        |     PDF Processing
        |           |
        |      PyMuPDF/OCR
        |           |
        +---- Extracted Data
                    |
              REVIEW ADMIN
                    |
              QUESTION BANK
```

## Alur PDF Processing

1. Admin upload PDF.
2. Next.js menyimpan metadata dan file.
3. Inngest menjalankan job.
4. Python Service membaca dokumen.
5. Ekstraksi teks dan OCR dilakukan jika dibutuhkan.
6. Hasil diproses menjadi data terstruktur.
7. Data disimpan sebagai draft.
8. Admin memvalidasi.
9. Data dipublikasikan ke bank soal atau materi.

---

# 15. UI/UX DESIGN GUIDELINES

SIAPASN harus memiliki tampilan modern, profesional, dan tidak terlalu ramai.

## 15.1 Identitas Visual

**Primary Color:** Navy Blue  
**Secondary Color:** Electric Blue  
**Background:** White / Light Gray  
**Accent:** Green untuk status berhasil.

Typography:
- Plus Jakarta Sans.
- Inter.

Gaya desain:
- Clean dashboard.
- Modern education platform.
- Minimalist cards.
- Rounded corners.
- Responsive layout.
- Konsisten antara admin dan peserta.

## 15.2 Halaman Website

### Public Pages
- Landing Page.
- Tentang SIAPASN.
- Fitur.
- Login.
- Register.
- FAQ.

### Admin Pages
- Dashboard.
- Manajemen PDF.
- Upload PDF.
- Review hasil ekstraksi.
- Bank Soal.
- Manajemen Materi.
- Kategori.
- Paket Tryout.
- Manajemen Pengguna.
- Hasil Ujian.
- Laporan.
- Pengaturan.

### User Pages
- Dashboard.
- Materi.
- Detail Materi.
- Latihan Soal.
- Simulasi CAT.
- Hasil Ujian.
- Riwayat.
- Leaderboard.
- Profil.

---

# 16. SECURITY REQUIREMENTS

Sistem wajib menerapkan:

1. Password hashing menggunakan Argon2id atau bcrypt.
2. Role-based access control.
3. Validasi seluruh request di server.
4. Validasi tipe dan ukuran file PDF.
5. Pembatasan akses file storage.
6. Proteksi endpoint admin.
7. Rate limiting.
8. Proteksi SQL injection melalui ORM.
9. Audit log aktivitas administrator.
10. Backup database otomatis.
11. HTTPS.
12. Validasi waktu ujian dari server.
13. Pencegahan akses langsung ke jawaban benar.
14. Sanitasi konten PDF untuk mencegah konten berbahaya.
15. Pengaturan retensi dan penghapusan file.

Soal dan kunci jawaban tidak boleh dikirim sekaligus ke browser. Backend hanya mengirimkan informasi yang diperlukan untuk mengerjakan ujian.

---

# 17. NON-FUNCTIONAL REQUIREMENTS

| Aspek | Target |
|---|---|
| Performance | Halaman utama idealnya tampil di bawah 3 detik |
| Responsive | Desktop, tablet, dan smartphone |
| Availability | Target uptime 99,5% |
| Scalability | Mendukung peningkatan jumlah peserta |
| Security | RBAC dan validasi server |
| Data Integrity | Autosave dan transaksi database |
| Maintainability | Modular architecture |
| SEO | Metadata dan sitemap |
| Accessibility | Navigasi keyboard dan kontras memadai |

Target performa merupakan sasaran pengembangan yang harus diuji, bukan jaminan otomatis.

---

# 18. DEVELOPMENT ROADMAP

Pengembangan dibagi menjadi beberapa fase agar fitur inti bisa segera digunakan.

## Phase 1 – Foundation

- Setup Next.js.
- Setup PostgreSQL.
- Prisma ORM.
- Authentication.
- Role-based access control.
- Admin dashboard.
- User dashboard.
- UI/UX design system.

## Phase 2 – PDF Management Engine

- Upload PDF.
- Cloudflare R2 integration.
- PDF Processing Service.
- Text extraction.
- OCR.
- Automatic question detection.
- Automatic material extraction.
- Preview hasil ekstraksi.
- Admin approval.
- Import ke database.

## Phase 3 – Learning Management

- Manajemen kategori.
- Manajemen bank soal.
- Manajemen materi.
- Subkategori.
- Pembahasan.
- Search dan filtering.

## Phase 4 – Examination System

- Pembuatan paket ujian.
- Random question generator.
- CAT interface.
- Countdown timer.
- Autosave.
- Penilaian TWK, TIU, TKP.
- Automatic submission.
- Result dashboard.

## Phase 5 – Analytics & Enhancement

- Riwayat ujian.
- Grafik perkembangan.
- Leaderboard.
- User notifications.
- Admin analytics.
- Audit logs.

## Phase 6 – Testing & Deployment

- Unit testing.
- Integration testing.
- Security testing.
- Load testing.
- PDF parsing accuracy testing.
- Production deployment.

---

# 19. MVP (MINIMUM VIABLE PRODUCT)

Untuk versi pertama, saya menyarankan fokus pada fitur yang benar-benar diperlukan.

Prioritas P0 – Wajib tersedia:

- Login dan registrasi.
- Admin dashboard.
- Upload PDF.
- PDF parsing engine.
- Review hasil ekstraksi.
- Import bank soal.
- Manajemen materi.
- Paket ujian.
- Simulasi CAT.
- Timer.
- Autosave.
- Penilaian.
- Hasil ujian.

Prioritas P1 – Pengembangan berikutnya:

- Leaderboard.
- Grafik perkembangan.
- Bookmark soal.
- Progress belajar.
- Analisis kemampuan.
- Export data.
- Notifikasi.

Prioritas P2 – Pengembangan lanjutan:

- Sistem langganan premium.
- Pembayaran online.
- Tryout berbayar.
- Sertifikat simulasi.
- AI tutor.
- Rekomendasi belajar berbasis performa.

---

# 20. ACCEPTANCE CRITERIA

Sistem dinyatakan siap untuk MVP ketika memenuhi kriteria berikut.

**PDF Management**
- Admin dapat mengunggah PDF.
- Sistem dapat memproses dokumen.
- Sistem dapat mendeteksi dan mengekstrak soal.
- Admin dapat melihat hasil ekstraksi.
- Admin dapat mengedit soal sebelum publikasi.
- Soal berhasil masuk ke database.
- Sistem dapat menangani PDF gagal diproses.

**Question Management**
- Admin dapat mengelola bank soal.
- Kategori dan subkategori dapat diatur.
- Setiap soal memiliki pilihan dan kunci jawaban.
- Soal dapat digunakan dalam paket ujian.

**Examination**
- Peserta dapat memulai ujian.
- Timer berjalan sesuai konfigurasi.
- Jawaban tersimpan otomatis.
- Peserta dapat berpindah antarsoal.
- Ujian dapat disubmit.
- Ujian otomatis selesai saat waktu habis.
- Hasil penilaian tersimpan di database.

**User Experience**
- Dashboard dapat diakses dengan baik di smartphone.
- Riwayat ujian tersedia.
- Peserta dapat melihat hasil dan pembahasan sesuai kebijakan ujian.

---

# 21. FINAL PRODUCT VISION

SIAPASN tidak hanya menjadi website latihan soal CPNS, tetapi berkembang menjadi platform persiapan seleksi ASN yang memiliki sistem pengelolaan konten otomatis.

Keunggulan utama yang ingin dicapai:

1. Admin cukup upload PDF untuk menambahkan materi dan soal.
2. Sistem otomatis mengekstrak dan mengelompokkan konten.
3. Admin dapat memvalidasi data sebelum dipublikasikan.
4. Peserta mendapatkan pengalaman simulasi CAT.
5. Nilai dan perkembangan peserta dapat dianalisis.
6. Sistem dapat dikembangkan menjadi platform edukasi berbayar.

**Prinsip utama pengembangan SIAPASN:**

*Upload Once, Process Automatically, Review Easily, Learn Effectively.*

Dokumen ini menjadi acuan utama pengembangan SIAPASN versi pertama.

<!-- BEGIN:theme-and-color-grading-rules -->
# Aturan Desain & Color Grading Tema Dinamis (PT Beruang Salju)

Aplikasi ini mendukung multi-tema dinamis (Light Theme, Dark/Obsidian Slate, Aquamarine Glacial, Sakura, Emerald, Amethyst, dsb).
Setiap pembuatan atau pembaruan halaman, kartu, modal, tabel, dan formulir **WAJIB** mengikuti aturan color grading berikut:

1. **Dilarang Keras Menggunakan Warna Statis / Hardcoded:**
   - JANGAN PERNAH memakai warna latar statis seperti `#fff`, `#ffffff`, `#000`, `#0f172a`, `#1e293b`, `white`, `black`, atau `rgba(255,255,255,...)` untuk kontainer utama, kartu, modal, tabel, dan input.
   - Menggunakan warna statis akan menyebabkan elemen "tabrakan" (misal: kartu tetap putih saat tema gelap, atau modal tetap hitam saat tema terang).

2. **Gunakan Semantic CSS Variables Secara Konsisten:**
   - **Kanvas Dasar:** `var(--bg-base)`
   - **Kartu / Panel / Stat Card:** `var(--bg-card)` atau gunakan class `className="card"`
   - **Header / Footer / Panel Navigasi:** `var(--bg-surface)`
   - **Modal Pop-up:** `var(--bg-modal, var(--bg-card))`
   - **Latar Hover / Wadah Sekunder:** `var(--bg-card-hover)`
   - **Form Input & Select:** `var(--bg-input)` atau gunakan class `className="form-input"`, `className="form-select"`
   - **Garis Batas / Border:** `var(--border)` dan `var(--border-strong)`
   - **Teks Utama (Judul, Isi Penting):** `var(--text-primary)`
   - **Teks Sekunder (Label, Deskripsi):** `var(--text-secondary)`
   - **Teks Lembut (Subtitle, Keterangan):** `var(--text-muted)`
   - **Tombol Utama:** gunakan class `className="btn btn-primary"`
   - **Tombol Sekunder & Batal:** gunakan class `className="btn btn-secondary"` atau `className="btn btn-ghost"`
   - **Status (Sukses / Warning / Error):** `var(--success)`, `var(--warning)`, `var(--error)`

3. **Verifikasi Kontras di 2 Mode Ekstrem:**
   - Selalu pastikan tampilan teruji baik di **Light Mode** (latar terang) maupun **Dark / Aquamarine / Obsidian** (latar gelap).
<!-- END:theme-and-color-grading-rules -->

<!-- BEGIN:core-ui-states-rules -->
# 10 Core UI States (Standar Wajib Desain & Pengalaman Pengguna)

Setiap pembuatan atau pembaruan halaman, kartu, modal, tabel, dan alur form di aplikasi PT Beruang Salju **WAJIB** menerapkan 10 Core UI States berikut secara konsisten:

1. **Empty State:**
   - Pandu pengguna sebelum data ada (*guide user before data exists*).
   - Tampilkan ikon/ilustrasi ramah, penjelasan singkat, dan tombol tindakan pertama (Call to Action / CTA, misal: *Tambah Data Baru* atau link panduan).

2. **Loading State:**
   - Kecepatan yang dirasakan sangat penting (*perceived speed matters; keep wait active*).
   - Gunakan skeleton placeholder atau spinner aktif dengan teks proses spesifik (*Memuat data transaksi...*), hindari layar kosong atau beku tanpa indikator.

3. **Error State:**
   - Jelaskan penyebab masalah secara transparan disertai tombol pemulihan (*clear cause plus actionable recovery*).
   - Sertakan tombol *Coba Lagi* / *Refresh* dan hindari pesan error teknis yang membingungkan staf.

4. **Offline State:**
   - Beri tahu status koneksi; cegah tampilan kosong (*inform state; prevent blank views*).
   - Pantau status jaringan (`navigator.onLine`, event `online`/`offline`). Tampilkan banner peringatan dan nonaktifkan tombol simpan/unggah untuk mencegah hilangnya input pengguna.

5. **Slow Network State:**
   - Tunjukkan kemajuan inkremental; hindari spinner beku (*show incremental progress, avoid frozen spinners*).
   - Berikan umpan balik bertahap saat mengunggah berkas resi atau proses API berat (*Mengunggah berkas resi...*, *Menyinkronkan ke server...*).

6. **Zero Search Results State:**
   - Berikan saran atau alternatif; hindari jalan buntu (*provide suggestions/alternatives, avoid dead ends*).
   - Tampilkan pesan bahwa pencarian tidak ditemukan, tombol *Reset Filter & Pencarian*, dan jika relevan opsi alternatif (*Gunakan kata kunci sebagai input manual*).

7. **Permission Denied State:**
   - Jelaskan alasan hak akses dan rute pemulihan (*explain rationale and recovery route*).
   - Beri informasi role/jabatan yang berwenang dan sediakan tombol kembali ke dashboard utama.

8. **Session Expiry & Draft Preservation:**
   - Amankan draf formulir sebelum sesi terputus (*persist draft state before auth teardown*).
   - Simpan draf input pengguna secara berkala ke penyimpanan lokal (`localStorage`). Jika halaman ter-refresh atau sesi terputus, tawarkan tombol *Pulihkan Draf*.

9. **Form Validation State:**
   - Tempatkan error validasi tepat di bawah input yang bersangkutan (*inline error placement at exact input field*).
   - Tandai border input dengan warna merah `var(--error)` dan tampilkan teks penjelasan spesifik tepat di bawah elemen input.

10. **Success State:**
    - Berikan apresiasi keberhasilan dan langkah selanjutnya yang jelas (*acknowledge completion, provide clear next step*).
    - Tampilkan notifikasi sukses, nomor referensi/pengajuan yang baru terbentuk, dan arahkan pengguna kembali ke daftar data atau tindakan selanjutnya.
<!-- END:core-ui-states-rules -->

# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SIAPASN – Cost-Efficient Architecture & Supabase Optimization

**Versi:** 1.1  
**Platform:** Web Application  
**Frontend:** Next.js App Router  
**Backend:** Next.js Server Actions & Route Handlers  
**Database:** Supabase PostgreSQL  
**ORM:** Prisma ORM (opsional)  
**Local Cache:** IndexedDB  
**Deployment:** Vercel

---

# 1. PROJECT OBJECTIVE

Pengembangan SIAPASN harus menggunakan arsitektur yang hemat resource, efisien dalam penggunaan database, dan mampu menangani pertumbuhan jumlah pengguna tanpa peningkatan biaya infrastruktur yang tidak terkendali.

Fokus utama:

1. Meminimalkan database queries ke Supabase.
2. Mengurangi penggunaan database bandwidth dan egress.
3. Mengurangi penggunaan Supabase Storage.
4. Mengoptimalkan penyimpanan soal dan jawaban.
5. Menggunakan IndexedDB untuk caching data di browser.
6. Menghindari penggunaan Supabase Realtime yang tidak diperlukan.
7. Memastikan aplikasi tetap responsif meskipun jumlah peserta meningkat.
8. Memungkinkan migrasi database ke PostgreSQL provider lain jika diperlukan.

# 2. TECHNOLOGY STACK

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Frontend | Next.js App Router | Aplikasi utama |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | UI styling |
| UI Components | shadcn/ui | Komponen antarmuka |
| Database | Supabase PostgreSQL | Database utama |
| Authentication | Supabase Auth | Autentikasi |
| Database Client | Supabase JS | Akses Supabase |
| ORM | Prisma (opsional) | Query database |
| Local Database | IndexedDB | Cache soal dan jawaban |
| Local Storage | Browser Local Storage | Preferensi sederhana |
| PDF Storage | Supabase Storage / Cloudflare R2 | Penyimpanan dokumen |
| PDF Processing | Python FastAPI | Pemrosesan PDF |
| PDF Parser | PyMuPDF | Ekstraksi teks |
| OCR | PaddleOCR | Membaca hasil scan |
| Background Jobs | Inngest | Pemrosesan asynchronous |
| Validation | Zod | Validasi data |
| Deployment | Vercel | Hosting aplikasi |
| Monitoring | Sentry | Monitoring error |

# 3. DATABASE OPTIMIZATION STRATEGY

## 3.1 Prinsip Utama

Supabase hanya digunakan sebagai pusat penyimpanan data dan sumber data utama.

Tidak semua aktivitas peserta harus melakukan request ke database.

Data yang sudah berhasil diambil dapat disimpan sementara di IndexedDB sehingga dapat digunakan kembali oleh browser.

Prinsip:

**Fetch Once, Cache Locally, Sync When Necessary.**

## 3.2 Pembagian Penyimpanan Data

| Data | Penyimpanan Utama | Cache Lokal |
|---|---|---|
| Akun pengguna | Supabase Auth | Tidak |
| Profil pengguna | Supabase | Local Storage terbatas |
| Bank soal | Supabase | IndexedDB |
| Materi belajar | Supabase | IndexedDB |
| File PDF | Object Storage | Tidak wajib |
| Jawaban ujian | Supabase | IndexedDB sebagai antrean |
| Hasil ujian | Supabase | Tidak |
| Riwayat ujian | Supabase | Cache terbatas |
| Preferensi tampilan | Browser | Local Storage |
| Progress belajar | Supabase | IndexedDB |

Kunci jawaban tidak boleh disimpan dalam cache peserta sebelum hasil ujian boleh ditampilkan.

# 4. INDEXEDDB LOCAL CACHING

IndexedDB menjadi komponen utama penghematan query database.

## 4.1 Fungsi IndexedDB

Digunakan untuk menyimpan:

- Soal yang sudah diunduh.
- Materi yang sudah dibuka.
- Draft jawaban ujian.
- Status navigasi soal.
- Progress pengerjaan.
- Data sementara ketika koneksi terputus.

## 4.2 Alur Pengambilan Soal

1. Peserta membuka halaman latihan.
2. Sistem memeriksa IndexedDB.
3. Jika data tersedia dan masih valid, gunakan cache lokal.
4. Jika data tidak tersedia, ambil dari backend.
5. Simpan hasil pengambilan ke IndexedDB.
6. Peserta mengerjakan soal tanpa request berulang untuk setiap perpindahan nomor.

## 4.3 Cache Versioning

Setiap kumpulan soal dan materi memiliki:

- Cache version.
- Updated timestamp.
- Content version.
- Expiration policy.

Jika admin memperbarui soal, sistem dapat mendeteksi perubahan melalui versi konten dan memperbarui cache yang terdampak.

Tidak perlu menghapus seluruh cache setiap kali ada satu soal berubah.

## 4.4 Cache Invalidation

Cache diperbarui ketika:

- Versi materi berubah.
- Soal diperbarui oleh admin.
- Paket ujian diperbarui.
- Pengguna melakukan refresh data.
- Masa berlaku cache habis.

Cache tidak boleh menjadi sumber kebenaran untuk nilai ujian atau status publikasi.

# 5. EXAMINATION ENGINE OPTIMIZATION

Sistem CAT harus dibuat agar penggunaan database tetap rendah meskipun banyak peserta mengerjakan ujian secara bersamaan.

## 5.1 Inisialisasi Ujian

Ketika peserta menekan tombol mulai:

1. Backend memvalidasi akun dan kelayakan mengikuti ujian.
2. Backend membuat exam attempt.
3. Backend mengambil soal sesuai paket.
4. Backend membuat snapshot soal untuk percobaan tersebut.
5. Backend mengirim soal tanpa kunci jawaban.
6. Browser menyimpan data soal di IndexedDB.
7. Timer mulai berjalan berdasarkan waktu server.

Setiap percobaan ujian harus mempunyai identitas unik.

## 5.2 Navigasi Soal

Perpindahan nomor soal tidak boleh memanggil database.

Seluruh soal yang diperlukan sudah tersedia di IndexedDB.

Contoh:
- Peserta membuka soal nomor 1.
- Berpindah ke nomor 2.
- Kembali ke nomor 1.
- Membuka nomor 50.

Seluruh aktivitas navigasi dilakukan secara lokal.

## 5.3 Autosave Jawaban

Gunakan sistem batch autosave.

Ketentuan:

- Perubahan jawaban langsung disimpan ke IndexedDB.
- Jawaban dikirim ke server dalam batch.
- Gunakan interval maksimal 15–30 detik saat terdapat perubahan.
- Lakukan sinkronisasi ketika peserta berpindah fokus atau koneksi pulih.
- Lakukan sinkronisasi sebelum submit.
- Jangan mengirim request jika tidak ada perubahan.
- Setiap perubahan jawaban memiliki revision number.
- Backend harus menghindari duplikasi pengiriman.

Interval tersebut merupakan konfigurasi awal yang harus diuji terhadap beban dan risiko kehilangan data.

## 5.4 Final Submission

Ketika peserta menyelesaikan ujian:

1. Browser mengirim seluruh jawaban yang belum tersinkron.
2. Backend memverifikasi identitas peserta.
3. Backend memverifikasi batas waktu.
4. Backend memvalidasi pilihan jawaban.
5. Backend menghitung nilai.
6. Backend menyimpan hasil akhir.
7. Status ujian diubah menjadi completed.
8. Hasil ditampilkan kepada peserta sesuai kebijakan ujian.

Nilai tidak boleh dihitung menggunakan data yang dikirim dari browser tanpa validasi server.

## 5.5 Offline Handling

Jika koneksi internet terputus:

- Peserta tetap dapat melihat soal yang sudah dicache.
- Jawaban disimpan sementara di IndexedDB.
- Sistem menampilkan indikator offline.
- Sistem mengantrekan jawaban untuk disinkronkan kembali.

Namun, waktu ujian tetap mengikuti batas waktu server. Ujian tidak boleh dapat diperpanjang hanya dengan memutus koneksi atau memanipulasi jam perangkat.

Jika peserta belum berhasil menyinkronkan jawaban sebelum batas waktu, sistem harus mempunyai mekanisme pemulihan yang aman dan mencatat status sinkronisasi.

# 6. DATABASE QUERY OPTIMIZATION

## 6.1 Pagination

Semua halaman admin dan peserta wajib menggunakan pagination.

Contoh:

- Bank soal: 20–50 data per halaman.
- Riwayat ujian: 10–20 data per halaman.
- Daftar pengguna: 20 data per halaman.
- Daftar materi: 20 data per halaman.

Jangan mengambil seluruh database dalam satu request.

## 6.2 Select Specific Columns

Hindari mengambil seluruh kolom database.

Contoh:

Tidak direkomendasikan:

SELECT *

Direkomendasikan:

SELECT id, title, category_id, updated_at

Ambil hanya data yang diperlukan oleh halaman.

## 6.3 Database Indexing

Tambahkan index untuk kolom yang sering digunakan:

- users.id
- users.email
- questions.category_id
- questions.subcategory_id
- questions.status
- materials.category_id
- exam_attempts.user_id
- exam_attempts.exam_package_id
- exam_answers.attempt_id
- documents.processing_status

Gunakan composite index jika query sering memfilter lebih dari satu kolom.

Index harus ditentukan berdasarkan query aktual dan hasil EXPLAIN ANALYZE, bukan ditambahkan secara berlebihan.

## 6.4 Query Consolidation

Gabungkan beberapa pengambilan data yang berkaitan ke satu endpoint jika memungkinkan.

Contoh:
- Dashboard peserta mengambil statistik yang diperlukan dalam satu agregasi.
- Detail paket ujian mengambil metadata dan daftar soal sekaligus.
- Hasil ujian mengambil nilai dan ringkasan kategori secara bersamaan.

Hindari pola N+1 query.

## 6.5 Server-Side Aggregation

Perhitungan statistik yang bisa dilakukan oleh database sebaiknya menggunakan SQL aggregation.

Contoh:
- Total ujian.
- Rata-rata nilai.
- Nilai tertinggi.
- Total latihan.
- Jumlah soal berdasarkan kategori.

Hindari mengambil seluruh riwayat ujian ke browser hanya untuk menghitung rata-rata.

# 7. SUPABASE STORAGE OPTIMIZATION

## 7.1 Pengelolaan PDF

PDF asli disimpan pada object storage.

Database hanya menyimpan metadata:

- Document ID.
- Nama file.
- File path.
- Ukuran file.
- Jumlah halaman.
- Kategori.
- Status pemrosesan.
- Tanggal upload.
- Admin pengunggah.

## 7.2 Storage Policy

Bucket yang digunakan:

- pdf-materi
- pdf-soal
- question-images
- material-images
- avatars

Gunakan private bucket untuk dokumen yang tidak boleh diakses publik.

## 7.3 Pengurangan Storage

- Hindari upload file duplikat.
- Terapkan checksum SHA-256 untuk mendeteksi file identik.
- Batasi ukuran upload.
- Kompres gambar pendukung soal.
- Jangan menyimpan hasil OCR yang identik berkali-kali.
- Terapkan kebijakan retensi untuk file sementara.
- Jangan menghapus PDF sumber yang masih dibutuhkan untuk audit atau pemrosesan ulang.

## 7.4 Cloudflare R2 sebagai Alternatif

Jika koleksi PDF berkembang besar, file PDF dapat dipindahkan ke Cloudflare R2.

Supabase tetap menjadi database utama.

Pemindahan file tidak harus mengubah seluruh sistem aplikasi.

# 8. SUPABASE REALTIME OPTIMIZATION

Supabase Realtime tidak wajib digunakan pada setiap fitur.

Penggunaannya dibatasi untuk kebutuhan yang benar-benar memerlukan pembaruan langsung.

Fitur yang tidak membutuhkan Realtime:
- Navigasi soal.
- Pembacaan materi.
- Pembacaan bank soal.
- Perpindahan halaman.
- Pembukaan riwayat ujian.

Realtime dapat dipertimbangkan untuk:
- Notifikasi administratif.
- Status pemrosesan PDF jika diperlukan.
- Monitoring peserta yang sedang ujian.

Untuk status pemrosesan PDF, polling dengan interval yang wajar dapat menjadi alternatif lebih sederhana.

# 9. SECURITY REQUIREMENTS

1. Menggunakan Supabase Auth.
2. Mengaktifkan Row Level Security.
3. Peserta hanya dapat membaca data miliknya.
4. Admin memiliki akses sesuai role.
5. Service Role Key hanya digunakan di backend.
6. Kunci jawaban tidak boleh dikirim ke client sebelum diizinkan.
7. Nilai ujian dihitung di server.
8. Timer divalidasi menggunakan server timestamp.
9. Semua request penting divalidasi menggunakan Zod.
10. Endpoint ujian menggunakan rate limiting.
11. Setiap submission memiliki idempotency protection.
12. Audit log mencatat aktivitas penting admin.
13. Cache browser tidak boleh digunakan untuk melewati otorisasi server.

# 10. DATA STRUCTURE OPTIMIZATION

Gunakan struktur database yang efisien.

Tabel utama:

- profiles
- categories
- subcategories
- documents
- questions
- question_options
- materials
- material_chapters
- exam_packages
- exam_package_questions
- exam_attempts
- exam_attempt_questions
- exam_answers
- exam_results
- exam_score_configs
- audit_logs

Gunakan UUID sebagai primary key.

## Optimasi tambahan

- Hindari menyimpan konten PDF binary di database.
- Gunakan foreign key dan constraint.
- Hindari menyimpan data yang sama pada banyak tabel tanpa kebutuhan.
- Simpan snapshot soal hanya ketika diperlukan untuk menjaga integritas riwayat ujian.
- Gunakan transaksi database untuk proses penyelesaian ujian.
- Hapus data cache atau log sementara sesuai kebijakan retensi.

# 11. API EFFICIENCY

Gunakan endpoint berdasarkan kebutuhan fitur.

Contoh:

| Endpoint | Fungsi |
|---|---|
| GET /api/materials | Mengambil daftar materi |
| GET /api/materials/:id | Mengambil detail materi |
| GET /api/exams | Mengambil daftar ujian |
| POST /api/exams/:id/start | Memulai ujian |
| GET /api/attempts/:id | Mengambil informasi ujian |
| POST /api/attempts/:id/sync | Sinkronisasi jawaban |
| POST /api/attempts/:id/submit | Menyelesaikan ujian |
| GET /api/results/:id | Mengambil hasil ujian |
| GET /api/admin/questions | Mengambil bank soal |
| POST /api/admin/documents | Upload dokumen |

Ketentuan:

- Gunakan pagination.
- Gunakan response payload seminimal mungkin.
- Hindari request berulang.
- Gunakan HTTP caching untuk konten publik yang aman.
- Jangan cache respons yang mengandung data pribadi atau kunci jawaban secara publik.
- Gunakan server-side authorization.

# 12. MONITORING & COST CONTROL

Buat halaman khusus Super Admin:

**Infrastructure Monitoring**

Informasi yang ditampilkan:

- Database size.
- Database connection usage.
- Storage usage.
- Egress usage.
- Jumlah API requests.
- Jumlah peserta aktif.
- Jumlah ujian berjalan.
- Rata-rata durasi ujian.
- Jumlah PDF diproses.
- Jumlah query berdasarkan kategori endpoint jika tersedia.
- Error rate.
- Estimasi penggunaan resource.

Monitoring harus menggunakan Supabase Management API atau sumber metrik resmi yang sesuai dengan hak akses proyek. Jangan mengekspos secret key monitoring kepada browser.

## Usage Alert

Buat sistem peringatan internal ketika penggunaan resource mencapai:

- 60%: Informasi.
- 75%: Peringatan.
- 90%: Kritis.

Angka tersebut merupakan threshold operasional SIAPASN, bukan batas paket Supabase.

# 13. BACKUP & DISASTER RECOVERY

Sistem harus memiliki:

- Backup database terjadwal.
- Backup dokumen penting.
- Dokumentasi proses restore.
- Pengujian restore berkala.
- Ekspor database yang dapat dipindahkan.
- Environment variables terpisah untuk development dan production.

Jangan mengandalkan Free Plan sebagai satu-satunya mekanisme backup.

# 14. SCALABILITY REQUIREMENTS

SIAPASN harus dirancang untuk mendukung pertumbuhan pengguna.

Target pengujian bertahap:

| Tahap | Simulasi Pengguna Bersamaan |
|---|---:|
| Development | 10 |
| MVP | 50 |
| Beta Testing | 100 |
| Load Testing | 500 |
| Scale Testing | 1.000 |

Target tersebut adalah skenario pengujian, bukan jaminan kapasitas infrastruktur.

Lakukan pengujian menggunakan k6 atau Artillery.

Evaluasi:
- Query latency.
- API response time.
- Database connections.
- Autosave reliability.
- Submission reliability.
- Error rate.
- Storage dan bandwidth usage.

# 15. DEVELOPMENT PRIORITY

## P0 – Wajib

- Supabase integration.
- Authentication.
- RLS.
- Admin dashboard.
- PDF upload.
- PDF parsing.
- Bank soal.
- Materi.
- CAT examination engine.
- IndexedDB caching.
- Batch autosave.
- Server-side scoring.

## P1 – Optimasi

- Cache versioning.
- Pagination.
- Database indexing.
- Query monitoring.
- Infrastructure monitoring.
- Backup automation.
- Error logging.
- Cache invalidation.

## P2 – Pengembangan Lanjutan

- Offline learning.
- Cloudflare R2 migration.
- Advanced analytics.
- Load balancing.
- Read replica jika diperlukan.
- Advanced cost optimization.

# 16. ACCEPTANCE CRITERIA

Sistem dinyatakan memenuhi persyaratan efisiensi apabila:

1. Perpindahan soal tidak menghasilkan database request.
2. Soal yang sudah dicache dapat digunakan kembali.
3. Kunci jawaban tidak tersedia di cache peserta.
4. Jawaban tersimpan lokal sebelum sinkronisasi.
5. Autosave tidak mengirim data yang tidak berubah.
6. Jawaban disinkronkan secara batch.
7. Sistem dapat memulihkan antrean sinkronisasi setelah koneksi kembali.
8. Seluruh halaman daftar menggunakan pagination.
9. Tidak ada query SELECT * yang tidak diperlukan.
10. Sistem tidak menggunakan Realtime secara berlebihan.
11. Admin dapat memonitor penggunaan resource.
12. Hasil ujian tetap dihitung dan divalidasi oleh server.
13. Database dapat diekspor untuk kebutuhan migrasi.
14. Restore backup telah diuji.

# 17. FINAL ARCHITECTURE PRINCIPLE

SIAPASN harus menggunakan pendekatan:

**Centralized Database + Local Cache + Minimal API Calls + Server-Side Validation.**

Supabase menjadi pusat penyimpanan dan sumber kebenaran data.

IndexedDB digunakan untuk menyimpan data yang boleh diakses peserta dan mengurangi pengambilan data berulang.

Next.js bertanggung jawab atas aplikasi utama dan business logic.

Python FastAPI bertanggung jawab atas pemrosesan PDF.

Object Storage bertanggung jawab atas file PDF dan gambar.

Dengan arsitektur ini, SIAPASN dapat menghemat penggunaan Supabase sekaligus mempertahankan integritas data, keamanan ujian, dan pengalaman pengguna.
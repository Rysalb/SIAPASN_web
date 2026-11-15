const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const richMaterials = [
  // ==========================================
  // TWK (Tes Wawasan Kebangsaan)
  // ==========================================
  {
    categoryCode: 'TWK',
    title: 'Pancasila: Falsafah, Sejarah Lahir, & 45 Butir Pengamalan',
    description: 'Panduan lengkap falsafah Pancasila, sejarah sidang BPUPKI-PPKI, Piagam Jakarta, perdebatan dasar negara, serta penjabaran 45 butir pengamalan sila ke-1 hingga sila ke-5 beserta studi kasusnya.',
    readTimeMinutes: 15,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Sejarah Pembentukan Pancasila & Piagam Jakarta',
        content: `### Latar Belakang & Sidang BPUPKI I (29 Mei – 1 Juni 1945)

Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia (BPUPKI) atau Dokuritsu Junbi Cosakai dibentuk pada 1 Maret 1945 dan diresmikan pada 28 Mei 1945 oleh Jenderal Kumakichi Harada. BPUPKI diketuai oleh **Dr. K.R.T. Radjiman Wedyodiningrat** dengan wakil ketua **Ichibangase Yosio** (Jepang) dan **R.P. Soeroso**.

Sidang Pertama BPUPKI berlangsung pada **29 Mei sampai 1 Juni 1945** dengan agenda utama membahas dasar negara Indonesia merdeka:

- **Mohammad Yamin (29 Mei 1945):** Mengusulkan 5 asas secara lisan (Peri Kebangsaan, Peri Kemanusiaan, Peri Ketuhanan, Peri Kerakyatan, dan Kesejahteraan Rakyat) serta konsep tertulis.
- **Prof. Dr. Soepomo (31 Mei 1945):** Mengusulkan konsep Negara Integralistik (Persatuan, Kekeluargaan, Keseimbangan lahir dan batin, Musyawarah, dan Keadilan rakyat).
- **Ir. Soekarno (1 Juni 1945):** Berpidato tanpa teks yang memperkenalkan istilah **Pancasila** (Kebangsaan Indonesia/Nasionalisme, Internasionalisme/Peri Kemanusiaan, Mufakat/Demokrasi, Kesejahteraan Sosial, dan Ketuhanan yang Berkebudayaan). Tanggal 1 Juni kemudian ditetapkan sebagai **Hari Lahir Pancasila**.

### Panitia Sembilan & Piagam Jakarta (22 Juni 1945)

Untuk menindaklanjuti usulan sidang pertama, dibentuk **Panitia Sembilan** yang diketuai oleh Ir. Soekarno dengan anggota: Mohammad Hatta, A.A. Maramis, Abikoesno Tjokrosoejoso, Abdoel Kahar Moezakir, H. Agus Salim, K.H. Wachid Hasyim, Mohammad Yamin, dan Achmad Soebardjo.

Pada tanggal **22 Juni 1945**, Panitia Sembilan berhasil merumuskan rancangan Pembukaan UUD yang dikenal dengan sebutan **Piagam Jakarta (Jakarta Charter)**. Pada sila pertama tercantum kalimat: *"Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya"*.

### Sidang PPKI 18 Agustus 1945 & Penetapan Resmi

Sehari setelah proklamasi kemerdekaan, Panitia Persiapan Kemerdekaan Indonesia (PPKI) menggelar sidang bersejarah pada **18 Agustus 1945**. Menanggapi keberatan dari tokoh Indonesia bagian timur (diwakili J. Latuharhary), Drs. Mohammad Hatta mengusulkan perubahan 7 kata pada Piagam Jakarta menjadi **"Ketuhanan Yang Maha Esa"** demi menjaga keutuhan dan persatuan bangsa.

Sidang PPKI 18 Agustus 1945 menghasilkan 3 keputusan fundamental:

1. Mengesahkan UUD 1945 (termasuk rumusan resmi Pancasila dalam Pembukaan alinea keempat).
2. Memilih Ir. Soekarno sebagai Presiden dan Drs. Mohammad Hatta sebagai Wakil Presiden.
3. Membentuk Komite Nasional Indonesia Pusat (KNIP) untuk membantu presiden sebelum terbentuknya MPR/DPR.`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Intisari 45 Butir Pengamalan Pancasila & Kasus TWK',
        content: `### Panduan Membedah Sila dalam Soal TWK HOTS

Soal TWK model HOTS tidak menanyakan bunyi butir hafalan secara mentah, melainkan menguji kemampuan peserta dalam membedakan ranah nilai antar-sila dalam kasus sosial-pemerintahan.

### Sila 1: Ketuhanan Yang Maha Esa

- **Kata Kunci:** Toleransi antarumat beragama, kebebasan menjalankan ibadah, tidak memaksakan agama kepada orang lain, kerukunan hidup beragama.
- **Contoh Kasus:** Seorang ASN menghormati rekan kerjanya yang sedang berpuasa atau meminta izin beribadah di tengah rapat kedinasan.

### Sila 2: Kemanusiaan yang Adil dan Beradab

- **Kata Kunci:** Hak Asasi Manusia (HAM), tenggang rasa (*tepa selira*), tidak semena-mena, kesetaraan derajat tanpa memandang suku/ras, misi kemanusiaan dan empati sosial.
- **Contoh Kasus:** Memberikan pertolongan pertama kepada korban bencana tanpa membedakan latar belakang korban, menentang perundungan (*bullying*) di lingkungan kantor.

### Sila 3: Persatuan Indonesia

- **Kata Kunci:** Cinta tanah air, rela berkorban demi bangsa dan negara, mendahulukan kepentingan bangsa di atas kepentingan pribadi/golongan, bangga menggunakan produk dalam negeri, menjaga perdamaian dunia.
- **Contoh Kasus:** Menggunakan batik buatan UMKM lokal dalam acara kedinasan internasional, memprioritaskan persatuan saat terjadi polarisasi pemilu.

### Sila 4: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan

- **Kata Kunci:** Musyawarah mufakat, tidak memaksakan kehendak pada orang lain, menghargai hasil keputusan bersama, mengutamakan dialog dalam penyelesaian sengketa, partisipasi dalam pemilu.
- **Contoh Kasus:** Pemimpin rapat mendengarkan masukan seluruh anggota staf sebelum memutuskan SOP baru dan menerima hasil mufakat dengan ikhlas.

### Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia

- **Kata Kunci:** Keseimbangan hak dan kewajiban, gotong royong, menghargai hasil karya orang lain, tidak bergaya hidup mewah (hemat/sederhana), tidak melakukan pemerasan kepada orang lain, fasilitas umum yang merata.
- **Contoh Kasus:** ASN yang menolak bergaya hidup pamer kekayaan (*flexing*), program pemerintah mendistribusikan listrik dan internet ke wilayah 3T (Tertinggal, Terdepan, Terluar).`
      },
      {
        orderNumber: 3,
        title: 'Bab 3: Kedudukan & Fungsi Pokok Pancasila',
        content: `### 5 Kedudukan Pokok Pancasila

Dalam sistem ketatanegaraan dan filsafat hukum Indonesia, Pancasila menempati posisi tertinggi:

1. **Pancasila sebagai Dasar Negara (Staatsfundamentalnorm):**
   Merupakan sumber dari segala sumber hukum negara (Pasal 2 UU No. 12 Tahun 2011). Segala peraturan perundang-undangan (UU, PP, Perpres, Perda) tidak boleh bertentangan dengan nilai Pancasila.

2. **Pancasila sebagai Pandangan Hidup Bangsa (Weltanschauung):**
   Petunjuk arah dan pedoman bersikap, bertingkah laku, dan mengambil keputusan moral dalam kehidupan bermasyarakat sehari-hari.

3. **Pancasila sebagai Kepribadian Bangsa:**
   Ciri khas, identitas, dan karakter pembeda bangsa Indonesia dari bangsa-bangsa lain di dunia (nilai kekeluargaan, musyawarah, dan gotong royong).

4. **Pancasila sebagai Ideologi Terbuka:**
   Memiliki nilai dasar yang tetap (abadi), namun memiliki nilai instrumental (UUD, UU, kebijakan) dan nilai praksis (penerapan nyata) yang dinamis, adaptif terhadap perkembangan zaman, sains, dan teknologi tanpa kehilangan jati dirinya.

5. **Pancasila sebagai Cita-Cita dan Tujuan Bangsa:**
   Termaktub dalam Pembukaan UUD 1945 alinea ke-4: melindungi segenap bangsa, memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia.`
      }
    ]
  },
  {
    categoryCode: 'TWK',
    title: 'UUD NRI Tahun 1945: Konstitusi, Lembaga Negara, & Amandemen I-IV',
    description: 'Bedah tuntas Undang-Undang Dasar 1945: tata urutan perundang-undangan, pasal-pasal kunci hak asasi manusia, wewenang lembaga negara pasca-reformasi, dan kronologi amandemen.',
    readTimeMinutes: 18,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Kronologi & Pasal Kunci 4 Kali Amandemen UUD 1945',
        content: `### Latar Belakang Gerakan Reformasi 1998

Sebelum reformasi, UUD 1945 memiliki kekuasaan presiden yang sangat dominan (*executive heavy*), pasal-pasal yang multitafsir, serta ketiadaan pembatasan masa jabatan presiden secara tegas. Maka MPR hasil Pemilu 1999 melaksanakan amandemen konstitusi secara bertahap dalam 4 kali sidang:

### 1. Amandemen I (14 – 21 Oktober 1999)
- **Fokus Utama:** Pembatasan kekuasaan eksekutif dan penguatan lembaga legislatif.
- **Pasal Kunci:** Pasal 5 (Presiden berhak mengajukan RUU ke DPR), Pasal 7 (Presiden dan Wapres memegang jabatan selama 5 tahun dan sesudahnya dapat dipilih kembali hanya untuk satu kali masa jabatan), Pasal 9, 13, 14, 15, 17, 20, dan 21.

### 2. Amandemen II (7 – 18 Agustus 2000)
- **Fokus Utama:** Otonomi daerah, Hak Asasi Manusia (HAM), wilayah negara, bendera, dan lambang negara.
- **Pasal Kunci:** Pasal 18, 18A, 18B (Otonomi Daerah & pengakuan masyarakat hukum adat), Pasal 25A (Wilayah Negara kepulauan), Pasal 28A sampai 28J (Piagam HAM lengkap), Pasal 35, 36A, 36B, 36C (Atribut Resmi Negara).

### 3. Amandemen III (1 – 9 November 2001)
- **Fokus Utama:** Bentuk kedaulatan, pembentukan lembaga peradilan baru, dan pemilihan presiden langsung.
- **Pasal Kunci:** Pasal 1 ayat (2) (Kedaulatan di tangan rakyat dilaksanakan menurut UUD), Pasal 1 ayat (3) (Indonesia adalah negara hukum), Pasal 6A (Pilpres langsung oleh rakyat), pembentukan Mahkamah Konstitusi (MK), Komisi Yudisial (KY), dan Dewan Perwakilan Daerah (DPD).

### 4. Amandemen IV (1 – 10 Agustus 2002)
- **Fokus Utama:** Lembaga kepresidenan lanjutan, penghapusan DPA, alokasi anggaran pendidikan, aturan mata uang, dan aturan peralihan.
- **Pasal Kunci:** Penghapusan DPA (Dewan Pertimbangan Agung), Pasal 31 ayat (4) (Prioritas anggaran pendidikan minimal 20% dari APBN/APBD), Pasal 23B (Mata uang adalah Rupiah), pembentukan Bank Sentral yang independen (Pasal 23D), serta 3 Pasal Aturan Peralihan dan 2 Pasal Aturan Tambahan.`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Struktur & Kewenangan Lembaga Negara Pasca-Amandemen',
        content: `### Prinsip Checks and Balances

Pasca amandemen, sistem ketatanegaraan Indonesia tidak lagi mengenal doktrin "Lembaga Tertinggi Negara" (yang sebelumnya dipegang oleh MPR). Seluruh lembaga negara berstatus setara dan saling mengawasi:

### 1. Majelis Permusyawaratan Rakyat (MPR)
- Terdiri atas anggota DPR dan anggota DPD (Pasal 2 ayat 1).
- **Wewenang:** Mengubah dan menetapkan UUD, melantik Presiden dan/atau Wakil Presiden, memberhentikan Presiden/Wapres dalam masa jabatannya menurut UUD (*impeachment*).

### 2. Dewan Perwakilan Rakyat (DPR)
- Memiliki 3 fungsi pokok: **Fungsi Legislasi, Fungsi Anggaran, dan Fungsi Pengawasan** (Pasal 20A ayat 1).
- Memiliki hak: **Hak Interpelasi** (meminta keterangan kebijakan pemerintah), **Hak Angket** (penyelidikan terhadap pelaksanaan undang-undang), dan **Hak Menyatakan Pendapat**.
- Setiap anggota DPR memiliki hak mengajukan pertanyaan, menyampaikan usul/pendapat, serta hak imunitas.

### 3. Mahkamah Konstitusi (MK) vs Mahkamah Agung (MA)

- **Mahkamah Konstitusi (MK):**
  Menguji undang-undang terhadap UUD 1945 (*Judicial Review*). Memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh UUD. Memutus pembubaran partai politik. Memutus perselisihan hasil pemilu (PHPU). Wajib memberikan putusan atas pendapat DPR mengenai dugaan pelanggaran hukum oleh Presiden/Wapres.

- **Mahkamah Agung (MA):**
  Mengadili pada tingkat kasasi. Menguji peraturan perundang-undangan di bawah undang-undang terhadap undang-undang (contoh: menguji Perpres atau Perda terhadap UU). Mengajukan 3 orang hakim konstitusi dan memberikan pertimbangan grasi serta rehabilitasi kepada Presiden.`
      }
    ]
  },
  {
    categoryCode: 'TWK',
    title: 'Integritas & Nilai-Nilai Antikorupsi ASN (Standar KPK)',
    description: 'Konsep dasar integritas aparatur sipil negara, pemahaman 9 nilai integritas KPK, pencegahan gratifikasi, benturan kepentingan, dan studi kasus etika birokrasi.',
    readTimeMinutes: 12,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: 9 Nilai Integritas Antikorupsi Standar KPK',
        content: `### Pengertian Integritas dalam Konteks ASN

Integritas adalah keselarasan yang utuh antara hati, ucapan, keyakinan moral, dan tindakan nyata dalam situasi apa pun, baik ketika diawasi maupun ketika tidak ada orang yang melihat.

Komisi Pemberantasan Korupsi (KPK) merumuskan **9 Nilai Integritas** yang dibagi ke dalam 3 rumpun utama:

### 1. Rumpun Inti
- **Jujur:** Berkata apa adanya, tidak curang, transparan dalam menyampaikan informasi kedinasan, tidak memanipulasi data anggaran atau absensi.
- **Tanggung Jawab:** Menyelesaikan tugas kedinasan dengan tuntas, berani menanggung konsekuensi atas setiap keputusan yang diambil, amanah memegang jabatan.
- **Disiplin:** Taat pada aturan jam kerja, mematuhi SOP kerja, menghargai waktu, dan tidak menunda pekerjaan.

### 2. Rumpun Sikap
- **Berani:** Berani menolak ajakan kompromi yang menyimpang, berani menegur bawahan/rekan yang melanggar aturan, berani melaporkan indikasi kecurangan (*whistleblowing*).
- **Peduli:** Menunjukkan kepekaan terhadap kesulitan masyarakat yang dilayani, tanggap terhadap kondisi rekan kerja dan fasilitas publik di instansi.
- **Adil:** Tidak diskriminatif dalam melayani warga, memperlakukan semua orang sama di depan hukum dan aturan, proporsional dalam membagi beban kerja.

### 3. Rumpun Etos Kerja
- **Mandiri:** Tidak bergantung pada orang lain untuk hal-hal yang menjadi tupoksi mandirinya, proaktif mengambil inisiatif.
- **Kerja Keras:** Bersungguh-sungguh mengerahkan tenaga dan pikiran untuk mencapai target instansi secara halal dan bermartabat.
- **Sederhana:** Hidup wajar sesuai kemampuan finansial, menolak gaya hidup konsumtif/pamer (*flexing*), menjaga kehormatan citra ASN.`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Gratifikasi, Suap, Pemerasan, & Benturan Kepentingan',
        content: `### Perbedaan Mendasar Tindak Pidana Korupsi

Dalam soal skenario TWK Integritas, peserta kerap diuji kasus pemberian barang atau uang kepada pejabat negara:

1. **Gratifikasi (Pasal 12B UU Tipikor):**
   Pemberian dalam arti luas (uang, barang, diskon, komisi, tiket perjalanan, voucher) kepada pegawai negeri atau penyelenggara negara yang berhubungan dengan jabatannya dan berlawanan dengan kewajibannya.
   - **Ketentuan Lapor:** Wajib dilaporkan ke KPK dalam waktu maksimal **30 hari kerja** sejak tanggal penerimaan.

2. **Suap (Bribery):**
   Bersifat transaksional (*quid pro quo*), ada kesepakatan pertemuan dua pihak (*meeting of mind*) sebelum atau saat tindakan dilakukan agar pejabat berbuat atau tidak berbuat sesuatu yang bertentangan dengan kewajibannya.

3. **Pemerasan (Extortion):**
   Inisiatif datang dari pihak pejabat/pegawai negeri yang memaksa seseorang untuk memberikan sesuatu atau membayar dengan ancaman penyalahgunaan kekuasaan.`
      }
    ]
  },

  // ==========================================
  // TIU (Tes Intelegensi Umum)
  // ==========================================
  {
    categoryCode: 'TIU',
    title: 'Kemampuan Verbal: Analogi Kata, Silogisme, & Penalaran Analitis',
    description: 'Metode cepat dan pola jitu menaklukkan soal analogi pasangan kata, logika penarikan kesimpulan silogisme kuantor, dan penataan posisi pada penalaran analitis.',
    readTimeMinutes: 15,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Metode Kalimat Jembatan pada Soal Analogi Kata',
        content: `### Prinsip Dasar Analogi

Soal analogi kata menguji daya nalar peserta dalam menemukan hubungan sebab-akibat, fungsi, hierarki, atau karakteristik antara dua kata, lalu mencari pasangan kata pilihan yang memiliki hubungan logika identik.

### Pola Hubungan yang Paling Sering Keluar:

1. **Hubungan Definisi / Karakteristik:**
   - SENAPAN : BERBURU = PERANGKAP : MENANGKAP
   - (Senapan digunakan untuk berburu, sebagaimana perangkap digunakan untuk menangkap).

2. **Hubungan Asosiasi / Habitat:**
   - BURUNG : UDARA = IKAN : AIR

3. **Hubungan Pekerja dan Produk / Alat:**
   - PENULIS : NOVEL = KOMPONIS : SIMFONI
   - DOKTER : STETOSKOP = KOKI : PISAU

4. **Hubungan Derajat Kualitas / Intensitas:**
   - HANGAT : PANAS = SEJUK : DINGIN (Intensitas bertingkat).
   - BISIK : TERIAK = BERJALAN : BERLARI

### Trik Emas "Buat Satu Kalimat Penghubung yang Kaku"

Jangan hanya melihat kata per kata. Buat kalimat penghubung utuh:
*"Kata A adalah tempat/alat untuk kata B"*. 

Lalu uji kalimat tersebut pada setiap pilihan opsi A, B, C, D, E. Pasangan yang polanya cocok tanpa membalik subjek-objek adalah jawaban yang benar.`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Rumus Baku Penarikan Kesimpulan Silogisme',
        content: `### 3 Kaidah Penarikan Kesimpulan Valid

1. **Modus Ponens:**
   - Premis 1: Jika P maka Q (P → Q)
   - Premis 2: Terjadi P (P)
   - **Kesimpulan:** Maka terjadi Q (Q)

2. **Modus Tollens:**
   - Premis 1: Jika P maka Q (P → Q)
   - Premis 2: Tidak terjadi Q (~Q)
   - **Kesimpulan:** Maka tidak terjadi P (~P)

3. **Silogisme Hipotetis:**
   - Premis 1: Jika P maka Q (P → Q)
   - Premis 2: Jika Q maka R (Q → R)
   - **Kesimpulan:** Jika P maka R (P → R)

### Aturan Silogisme Kuantor (Semua vs Sebagian)

- **Kaidah 1:** Jika salah satu premis partikular (*Beberapa / Sebagian / Ada*), maka kesimpulan **WAJIB** partikular (*Beberapa / Sebagian / Ada*). Tidak boleh berkesimpulan "Semua".
- **Kaidah 2:** Jika salah satu premis negatif (*Tidak / Bukan*), maka kesimpulan **WAJIB** berupa pernyataan negatif.
- **Kaidah 3:** Dari dua premis partikular atau dua premis negatif, **TIDAK DAPAT** ditarik kesimpulan yang pasti.
- **Catatan Istilah:** Kata *"Beberapa"*, *"Sebagian"*, *"Sementara"*, dan *"Ada"* memiliki kedudukan logika yang sama (minimal 1 elemen memenuhi syarat, tidak harus seluruhnya).`
      }
    ]
  },
  {
    categoryCode: 'TIU',
    title: 'Kemampuan Numerik: Pola Deret Angka & Huruf Lengkap',
    description: 'Trik mengidentifikasi jenis-jenis pola deret angka: barisan aritmatika bertingkat, deret geometri, fibonacci, deret larik ganda, dan deret huruf abjad.',
    readTimeMinutes: 14,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Bedah 6 Tipe Pola Deret Angka CAT CPNS',
        content: `### Cara Mengetahui Pola Deret dalam 5 Detik

Saat melihat deret angka, langkah pertama adalah melihat tren angka:
- Jika lonjakannya perlahan dan stabil: pola penjumlahan/pengurangan bertingkat (+2, +4, +6...).
- Jika lonjakannya sangat cepat dan drastis: pola perkalian/pemangkatan (×2, ×3... atau n², n³).
- Jika angka naik-turun selang-seling: pola **Deret Larik (Lompat 1 atau Lompat 2)**.

### 4 Tipe Pola Utama:

1. **Deret Aritmatika Bertingkat (Tingkat 2 / 3):**
   - Barisan: 3, 4, 7, 12, 19, 28...
   - Selisih tingkat 1: +1, +3, +5, +7, +9 (bilangan ganjil berurutan).

2. **Deret Fibonacci:**
   - Suku berikutnya adalah hasil penjumlahan dua suku tepat di depannya:
   - Barisan: 2, 3, 5, 8, 13, 21, 34... (karena 2+3=5, 3+5=8, 5+8=13).

3. **Deret Dua Larik (Pola Melompat):**
   - Barisan: 5, 12, 7, 15, 9, 18, 11, ...
   - Larik Ganjil: 5, 7, 9, 11... (bertambah +2)
   - Larik Genap: 12, 15, 18... (bertambah +3)
   - Suku berikutnya adalah kelanjutan larik genap: 18 + 3 = 21.

4. **Deret Huruf Abjad:**
   - Trik tercepat: Langsung ubah huruf menjadi angka posisinya:
   - A=1, B=2, C=3, D=4, E=5, ... Z=26.
   - Contoh: B, E, H, K, ... → 2, 5, 8, 11... (pola +3). Maka suku berikutnya 11 + 3 = 14 → N.`
      }
    ]
  },
  {
    categoryCode: 'TIU',
    title: 'Aritmatika Sosial, Kecepatan, & Soal Cerita Matematika',
    description: 'Kumpulan rumus praktis aritmatika sosial, diskon bertingkat, perbandingan senilai dan berbalik nilai, serta rumus jarak-waktu berpapasan dan menyusul.',
    readTimeMinutes: 16,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Rumus Cepat Perbandingan Senilai & Berbalik Nilai',
        content: `### 1. Perbandingan Senilai (Direct Proportion)

Jika variabel A naik, maka variabel B juga ikut naik secara proporsional.
- **Contoh Kasus:** Jumlah liter bensin vs Jarak tempuh kendaraan, Jumlah barang belanjaan vs Total harga bayar.
- **Prinsip Operasi:** A1 × B2 = A2 × B1

### 2. Perbandingan Berbalik Nilai (Inverse Proportion)

Jika variabel A bertambah, maka variabel B justru berkurang.
- **Contoh Kasus:** Jumlah pekerja bangunan vs Waktu penyelesaian renovasi, Kecepatan berkendara vs Waktu tempuh perjalanan.
- **Prinsip Operasi:** A1 × B1 = A2 × B2

### Trik Kasus Pekerja Tambahan yang Berhenti di Tengah Jalan

Sebuah proyek direncanakan selesai dalam W1 hari oleh P1 pekerja. Setelah berjalan W_jalan hari, pekerjaan terhenti selama W_libur hari. Berapa pekerja tambahan (P_tambah) yang dibutuhkan agar proyek selesai tepat waktu?

$$Pekerja Tambahan = (W_libur × P1) / W_sisa$$

> Tips: Rumus cepat ini menghemat waktu pengerjaan dari 3 menit menjadi 15 detik saja!`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Rumus Waktu Berpapasan & Menyusul',
        content: `### 1. Waktu Berpapasan dengan Waktu Berangkat Bersamaan

Dua orang berangkat saling mendekat dari dua kota terpisah berjarak S dengan kecepatan V1 dan V2:

$$Waktu Papasan = Jarak Total / (V1 + V2)$$

### 2. Waktu Berpapasan dengan Waktu Berangkat Berbeda

Jika orang pertama berangkat lebih dulu sehingga sudah menempuh jarak selisih (S_awal = V1 × Δt):

$$Waktu Papasan = (Jarak Total - S_awal) / (V1 + V2)$$

### 3. Waktu Menyusul (Berangkat dari Titik Sama, Waktu Berbeda)

Orang pertama berangkat lebih dulu dengan kecepatan V1, lalu orang kedua menyusul dengan kecepatan V2 (V2 > V1):

$$Waktu Menyusul = (V1 × Δt) / (V2 - V1)$$`
      }
    ]
  },

  // ==========================================
  // TKP (Tes Karakteristik Pribadi)
  // ==========================================
  {
    categoryCode: 'TKP',
    title: 'Strategi Meraih Skor Maksimal 5 pada Soal TKP CPNS',
    description: 'Panduan pola pikir asesor BKN dalam menilai kompetensi kepribadian: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, dan Anti Radikalisme.',
    readTimeMinutes: 16,
    chapters: [
      {
        orderNumber: 1,
        title: 'Bab 1: Bedah Karakter Pilihan Jawaban Bernilai 5',
        content: `### Prinsip Dasar Penilaian TKP

Pada subtes TKP tidak ada jawaban salah (skor 0). Pilihan dinilai bertingkat dari skor 1 hingga skor 5. Kunci kelulusan passing grade TKP (166 poin) adalah konsisten memilih opsi dengan nilai 5 dan menghindari opsi bernilai 1 atau 2.

### Karakteristik Jawaban Bernilai 5 Berdasarkan Dimensi:

1. **Pelayanan Publik (Skor 5):**
   Mengutamakan kepuasan masyarakat yang dilayani di atas kenyamanan pribadi. Bersikap santun, solutif, cepat, tepat, dan tetap taat aturan/SOP tanpa bersikap kaku yang merugikan warga. Menghindari melempar tanggung jawab atau meminta warga menunggu tanpa kejelasan.

2. **Jejaring Kerja & Kolaborasi (Skor 5):**
   Menghargai perbedaan sudut pandang rekan kerja dalam rapat/tim. Proaktif menawarkan bantuan kepada rekan tim yang sedang mengalami kendala. Mengutamakan komunikasi langsung yang konstruktif ketimbang menyindir di media sosial.

3. **Profesionalisme (Skor 5):**
   Memisahkan urusan pribadi dari kewajiban kedinasan. Bekerja tuntas melampaui standar minimal dengan penuh rasa kepemilikan (*sense of belonging*). Terbuka terhadap evaluasi dan gigih meningkatkan keahlian kerja mandiri.

4. **Sosial Budaya & Anti Radikalisme (Skor 5):**
   Bersikap inklusif, menghormati keragaman adat, ras, dan agama di tempat penempatan tugas. Memiliki komitmen kebangsaan yang kokoh pada Pancasila dan UUD 1945. Waspada dan menolak segala bentuk provokasi ujaran kebencian atau intoleransi di lingkungan instansi.`
      },
      {
        orderNumber: 2,
        title: 'Bab 2: Manajemen Waktu & Pola Jawaban Jebakan TKP',
        content: `### Mengapa Banyak Peserta Gagal di TKP?

Banyak peserta gagal passing grade TKP bukan karena kurang pintar, melainkan karena kehabisan waktu membaca soal narasi panjang (*HOTS*) dan terjebak pada opsi yang terdengar emosional atau pasif.

### 3 Jebakan Utama Opsi TKP:

1. **Jebakan Pasif / Pengamat:**
   Opsi seperti *"Menunggu instruksi atasan terlebih dahulu"* atau *"Mengamati situasi perkembangannya"*. Nilai biasanya hanya bernilai 2 atau 3 karena tidak menunjukkan inisiatif aksi nyata.

2. **Jebakan Reaktif / Emosional:**
   Opsi seperti *"Langsung memarahi warga yang mengantre tidak tertib"* atau *"Menegur rekan kerja di depan umum"*. Nilai sangat rendah (skor 1 atau 2).

3. **Jebakan Melanggar Integritas Demi Kebaikan Palsu:**
   Opsi seperti *"Memberikan kelonggaran dokumen tanpa verifikasi karena merasa kasihan kepada warga"*. Nilai rendah karena ASN wajib taat asas dan regulasi hukum.

### Mindset ASN Ideal:

Pilihlah jawaban yang menunjukkan Anda adalah sosok yang **dewasa, tenang menghadapi tekanan, berinisiatif tinggi, memprioritaskan kepentingan bersama, dan selalu mencari solusi tuntas.**`
      }
    ]
  }
];

async function seedRichMaterials() {
  console.log('--- RE-SEEDING CLEAN FORMATTED RICH LEARNING MATERIALS ---');

  const categories = await prisma.category.findMany();
  const catMap = {
    TWK: categories.find((c) => c.code === 'TWK')?.id,
    TIU: categories.find((c) => c.code === 'TIU')?.id,
    TKP: categories.find((c) => c.code === 'TKP')?.id,
  };

  for (const m of richMaterials) {
    const categoryId = catMap[m.categoryCode];
    if (!categoryId) continue;

    console.log(`Updating: [${m.categoryCode}] ${m.title}`);

    const existing = await prisma.material.findFirst({
      where: { title: m.title },
      include: { chapters: true },
    });

    if (existing) {
      await prisma.material.update({
        where: { id: existing.id },
        data: {
          description: m.description,
          content: m.chapters[0]?.content || '',
          readTimeMinutes: m.readTimeMinutes,
        },
      });

      for (const ch of m.chapters) {
        const existingCh = existing.chapters.find((c) => c.orderNumber === ch.orderNumber);
        if (existingCh) {
          await prisma.materialChapter.update({
            where: { id: existingCh.id },
            data: {
              title: ch.title,
              content: ch.content,
            },
          });
        } else {
          await prisma.materialChapter.create({
            data: {
              materialId: existing.id,
              title: ch.title,
              content: ch.content,
              orderNumber: ch.orderNumber,
            },
          });
        }
      }
      console.log(`  ✓ Updated: ${existing.title} (${m.chapters.length} chapters)`);
    } else {
      await prisma.material.create({
        data: {
          title: m.title,
          description: m.description,
          categoryId,
          content: m.chapters[0]?.content || '',
          readTimeMinutes: m.readTimeMinutes,
          status: 'PUBLISHED',
          chapters: {
            create: m.chapters.map((ch) => ({
              title: ch.title,
              content: ch.content,
              orderNumber: ch.orderNumber,
            })),
          },
        },
      });
      console.log(`  ✓ Created: ${m.title}`);
    }
  }

  console.log('--- RE-SEEDING COMPLETED ---');
}

seedRichMaterials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

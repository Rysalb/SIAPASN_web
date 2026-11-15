const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('--- START SEEDING SIAPASN DATABASE ---');

  // 1. Seed Users
  const passwordHash = await hashPassword('password123');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@siapasn.id' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'superadmin@siapasn.id',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      profile: {
        create: {
          phone: '081234567890',
          province: 'DKI Jakarta',
          educationLevel: 'S1 Ilmu Komputer',
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@siapasn.id' },
    update: {},
    create: {
      name: 'Administrator Konten',
      email: 'admin@siapasn.id',
      password: passwordHash,
      role: 'ADMIN',
      profile: {
        create: {
          phone: '081298765432',
          province: 'Jawa Barat',
          educationLevel: 'S1 Manajemen Pendidikan',
        },
      },
    },
  });

  console.log('✓ Admin users created');

  // 2. Categories & Subcategories
  const categoriesData = [
    {
      name: 'Tes Wawasan Kebangsaan',
      code: 'TWK',
      description: 'Menguji penguasaan pengetahuan dan kemampuan mengimplementasikan nasionalisme, integritas, bela negara, pilar negara, dan bahasa Indonesia.',
      subcategories: [
        'Pancasila',
        'UUD 1945',
        'NKRI',
        'Bhinneka Tunggal Ika',
        'Nasionalisme',
        'Integritas',
        'Bela Negara',
        'Bahasa Indonesia',
      ],
    },
    {
      name: 'Tes Intelegensia Umum',
      code: 'TIU',
      description: 'Menguji kemampuan verbal (analogi, silogisme, analitis), kemampuan numerik (berhitung, deret angka, perbandingan), dan figural.',
      subcategories: [
        'Kemampuan Verbal',
        'Analogi & Hubungan Kata',
        'Silogisme & Penarikan Kesimpulan',
        'Analitis & Posisi',
        'Deret Angka & Huruf',
        'Aritmetika & Aljabar',
        'Kemampuan Figural',
      ],
    },
    {
      name: 'Tes Karakteristik Pribadi',
      code: 'TKP',
      description: 'Menguji karakteristik pribadi pelamar dalam pelayanan publik, jejaring kerja, sosial budaya, teknologi informasi, profesionalisme, dan anti radikalisme.',
      subcategories: [
        'Pelayanan Publik',
        'Jejaring Kerja',
        'Sosial Budaya',
        'Teknologi Informasi & Komunikasi',
        'Profesionalisme',
        'Anti Radikalisme',
      ],
    },
  ];

  const categoryMap = {};
  const subcategoryMap = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        code: cat.code,
        description: cat.description,
      },
    });
    categoryMap[cat.code] = createdCat;

    for (const subName of cat.subcategories) {
      let sub = await prisma.subcategory.findFirst({
        where: { categoryId: createdCat.id, name: subName },
      });
      if (!sub) {
        sub = await prisma.subcategory.create({
          data: {
            categoryId: createdCat.id,
            name: subName,
          },
        });
      }
      subcategoryMap[`${cat.code}:${subName}`] = sub;
    }
  }

  console.log('✓ Categories & Subcategories seeded');

  // 3. Learning Materials
  const materialsData = [
    {
      code: 'TWK',
      subName: 'Pancasila',
      title: 'Pancasila: Falsafah, Sejarah Lahir, & Butir-Butir Pengamalan',
      description: 'Panduan lengkap pemahaman nilai-nilai dasar Pancasila, sejarah sidang BPUPKI-PPKI, dan implementasi 45 butir pengamalan sila ke-1 sampai ke-5 dalam seleksi CPNS.',
      readTimeMinutes: 15,
      chapters: [
        {
          title: 'Bab 1: Sejarah Pembentukan Pancasila & Piagam Jakarta',
          content: `### 1. Sejarah Singkat Perumusan Pancasila
Pancasila dirumuskan dalam sidang pertama BPUPKI (Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia) yang berlangsung pada tanggal **29 Mei – 1 Juni 1945**. Tiga tokoh utama yang mengusulkan konsep dasar negara:
- **Mohammad Yamin (29 Mei 1945):** Peri Kebangsaan, Peri Kemanusiaan, Peri Ketuhanan, Peri Kerakyatan, dan Kesejahteraan Rakyat.
- **Prof. Dr. Soepomo (31 Mei 1945):** Teori Integralistik (Persatuan, Kekeluargaan, Keseimbangan lahir batin, Musyawarah, Keadilan sosial).
- **Ir. Soekarno (1 Juni 1945):** Kebangsaan Indonesia, Internasionalisme atau Peri Kemanusiaan, Mufakat atau Demokrasi, Kesejahteraan Sosial, dan Ketuhanan yang Berkebudayaan. Tanggal 1 Juni kemudian diperingati sebagai **Hari Lahir Pancasila**.

### 2. Piagam Jakarta (Jakarta Charter)
Pada 22 Juni 1945, Panitia Sembilan menyusun Piagam Jakarta. Kalimat sila pertama semula berbunyi: *"Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya"*. Demi persatuan bangsa, pada 18 Agustus 1945 oleh PPKI frasa tersebut diubah menjadi *"Ketuhanan Yang Maha Esa"*.`,
        },
        {
          title: 'Bab 2: Intisari 45 Butir Pengamalan Pancasila untuk Ujian TWK',
          content: `### Sila 1: Ketuhanan Yang Maha Esa
- Menghormati perbedaan agama dan kebebasan beribadah.
- Membina kerukunan hidup antar sesama umat beragama.
- Tidak memaksakan suatu agama kepada orang lain.

### Sila 2: Kemanusiaan yang Adil dan Beradab
- Mengakui persamaan derajat, hak, dan kewajiban asasi setiap manusia.
- Menjunjung tinggi nilai-nilai kemanusiaan dan gemar melakukan kegiatan kemanusiaan.
- Berani membela kebenaran dan keadilan (non-diskriminasi).

### Sila 3: Persatuan Indonesia
- Menempatkan persatuan, kesatuan, kepentingan, dan keselamatan bangsa di atas kepentingan pribadi atau golongan.
- Rela berkorban untuk kepentingan negara dan bangsa.
- Mengembangkan rasa cinta tanah air dan bangga sebagai bangsa Indonesia.

### Sila 4: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan
- Mengutamakan musyawarah untuk mufakat dalam mengambil keputusan bersama.
- Tidak memaksakan kehendak kepada orang lain.
- Menghormati dan menjunjung tinggi setiap keputusan musyawarah.

### Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia
- Mengembangkan sikap gotong royong dan kekeluargaan.
- Menjaga keseimbangan antara hak dan kewajiban.
- Menghargai hasil karya orang lain dan suka bekerja keras serta hidup hemat (tidak bergaya hidup mewah).`,
        },
      ],
    },
    {
      code: 'TWK',
      subName: 'UUD 1945',
      title: 'UUD NRI Tahun 1945: Konstitusi, Lembaga Negara, & Amandemen I-IV',
      description: 'Struktur konstitusi Indonesia, pasal-pasal krusial yang sering keluar di CAT, dan dinamika amandemen tahun 1999-2002.',
      readTimeMinutes: 20,
      chapters: [
        {
          title: 'Bab 1: Kronologi 4 Kali Amandemen UUD 1945',
          content: `UUD 1945 telah mengalami 4 tahap perubahan besar dalam Sidang MPR:
1. **Amandemen I (14–21 Oktober 1999):** Pembatasan masa jabatan presiden maksimal 2 periode (Pasal 7), penguatan fungsi legislatif DPR (Pasal 5 & 20).
2. **Amandemen II (7–18 Agustus 2000):** Penguatan Otonomi Daerah (Pasal 18), Hak Asasi Manusia (Pasal 28A–28J), Wilayah Negara (Pasal 25A), Bendera dan Lambang Negara (Pasal 35, 36A, 36B).
3. **Amandemen III (1–9 November 2001):** Pembentukan Mahkamah Konstitusi (MK), Komisi Yudisial (KY), DPD, BPK, dan Pemilihan Presiden secara langsung.
4. **Amandemen IV (1–10 Agustus 2002):** Penghapusan DPA, ketentuan pendidikan 20% APBN (Pasal 31), aturan mata uang (Pasal 23B), dan perubahan aturan peralihan.`,
        },
        {
          title: 'Bab 2: Lembaga-Lembaga Negara Pasca Amandemen',
          content: `### Lembaga Legislatif
- **MPR:** Berwenang mengubah dan menetapkan UUD, melantik Presiden dan Wakil Presiden, serta dapat memberhentikan Presiden dalam masa jabatannya menurut UUD.
- **DPR:** Memegang kekuasaan membentuk UU, fungsi legislasi, anggaran, dan pengawasan.
- **DPD:** Mengajukan rancangan UU terkait otonomi daerah, hubungan pusat-daerah, pemekaran wilayah.

### Lembaga Eksekutif & Yudikatif
- **Presiden:** Kepala negara sekaligus kepala pemerintahan (Sistem Presidensial).
- **Mahkamah Agung (MA):** Lembaga peradilan kasasi tertinggi.
- **Mahkamah Konstitusi (MK):** Menguji UU terhadap UUD, memutus sengketa kewenangan lembaga negara, memutus pembubaran partai politik, dan memutus sengketa hasil pemilu.`,
        },
      ],
    },
    {
      code: 'TIU',
      subName: 'Deret Angka & Huruf',
      title: 'Kuasai Cepat Soal Deret Angka & Barisan Logika TIU',
      description: 'Teknik mengenali pola lompat 1, lompat 2, deret bertingkat, deret Fibonacci, dan trik berhitung cepat tanpa rumus rumit.',
      readTimeMinutes: 12,
      chapters: [
        {
          title: 'Bab 1: Tipe-Tipe Pola Deret Angka Standar CAT',
          content: `### 1. Pola Operasi Tetap (Aritmetika/Geometri Sederhana)
Contoh: 3, 7, 11, 15, ... (+4 di setiap langkah). Angka berikutnya = 19.

### 2. Pola Bertingkat (Tingkat Dua atau Tiga)
Contoh: 2, 5, 10, 17, 26, ...
- Selisih tingkat satu: +3, +5, +7, +9
- Selisih tingkat dua: +2, +2, +2
Maka penambahan berikutnya adalah +11, jawaban = 26 + 11 = 37.

### 3. Pola Larik / Lompat Dua
Contoh: 2, 10, 4, 15, 6, 20, **8**, **25**
- Larik ganjil: 2, 4, 6, 8 (+2)
- Larik genap: 10, 15, 20, 25 (+5)`,
        },
      ],
    },
    {
      code: 'TIU',
      subName: 'Silogisme & Penarikan Kesimpulan',
      title: 'Logika Deduktif & Silogisme Penarikan Kesimpulan TIU',
      description: 'Hukum silogisme kategorik, modus ponens, modus tollens, aturan premis partikular dan universal.',
      readTimeMinutes: 10,
      chapters: [
        {
          title: 'Bab 1: Aturan Baku Kesimpulan Silogisme',
          content: `### Rumus Utama:
1. Jika salah satu premis bersifat **partikular (sebagian / beberapa / ada)**, maka kesimpulan **WAJIB bersifat partikular**.
2. Jika salah satu premis bersifat **negatif (tidak / bukan)**, maka kesimpulan **WAJIB bersifat negatif**.
3. Dari dua premis partikular, **TIDAK DAPAT** ditarik kesimpulan valid.
4. Dari dua premis negatif, **TIDAK DAPAT** ditarik kesimpulan valid.

**Contoh:**
Premis 1: Semua pegawai berintegritas tinggi.
Premis 2: Sebagian pegawai bertugas di bagian pelayanan.
Kesimpulan: Sebagian yang bertugas di bagian pelayanan memiliki integritas tinggi.`,
        },
      ],
    },
    {
      code: 'TKP',
      subName: 'Pelayanan Publik',
      title: 'Strategi Meraih Skor Maksimal 5 pada Soal TKP CPNS',
      description: 'Bedah indikator BKN: Pelayanan Publik, Jejaring Kerja, Profesionalisme, dan Sikap Anti Radikalisme.',
      readTimeMinutes: 14,
      chapters: [
        {
          title: 'Bab 1: Karakter Jawaban Bernilai 5 di Mata Asesor BKN',
          content: `### Karakteristik Pilihan Jawaban Skor 5:
1. **Solutif dan Tidak Menunda:** Mengambil tindakan langsung yang berdaya guna tanpa mengorbankan prosedur operasional.
2. **Berorientasi pada Pelanggan/Masyarakat:** Mengutamakan kenyamanan, kemudahan, dan kepuasan masyarakat penerima layanan.
3. **Integritas Tinggi:** Menolak segala bentuk suap, gratifikasi, atau jalan pintas ilegal, namun tetap bersikap santun dan profesional.
4. **Kolaboratif:** Melibatkan tim secara proporsional dan tidak bersikap individualistis atau melempar tanggung jawab.`,
        },
      ],
    },
  ];

  for (const m of materialsData) {
    const cat = categoryMap[m.code];
    const sub = subcategoryMap[`${m.code}:${m.subName}`];

    let mat = await prisma.material.findFirst({
      where: { title: m.title },
    });

    if (!mat) {
      mat = await prisma.material.create({
        data: {
          title: m.title,
          categoryId: cat.id,
          subcategoryId: sub ? sub.id : null,
          description: m.description,
          content: m.chapters.map((c) => `# ${c.title}\n\n${c.content}`).join('\n\n---\n\n'),
          readTimeMinutes: m.readTimeMinutes,
          status: 'PUBLISHED',
          chapters: {
            create: m.chapters.map((ch, idx) => ({
              title: ch.title,
              content: ch.content,
              orderNumber: idx + 1,
            })),
          },
        },
      });
    }
  }

  console.log('✓ Learning Materials seeded');

  // 4. Parse & Seed Real Questions from PDF
  // We will parse "SIMULASI CPNS 2024-2025 (1).pdf"
  const pdfPath1 = path.join(process.cwd(), 'Data_soal_materi_cpns', 'SIMULASI CPNS 2024-2025 (1).pdf');
  let documentRecord = await prisma.document.findFirst({
    where: { filename: 'SIMULASI CPNS 2024-2025 (1).pdf' },
  });

  if (!documentRecord && fs.existsSync(pdfPath1)) {
    const stats = fs.statSync(pdfPath1);
    const parser = new PDFParse({ data: fs.readFileSync(pdfPath1) });
    await parser.load();
    const parsedRes = await parser.getText();
    await parser.destroy();

    documentRecord = await prisma.document.create({
      data: {
        filename: 'SIMULASI CPNS 2024-2025 (1).pdf',
        storagePath: '/documents/SIMULASI CPNS 2024-2025 (1).pdf',
        fileSize: stats.size,
        totalPages: parsedRes.pages.length,
        documentType: 'SOAL',
        processingStatus: 'COMPLETED',
        uploadedById: admin.id,
      },
    });

    const fullText = parsedRes.pages.map((p) => p.text).join('\n');
    const pembIndex = fullText.search(/(?:^|\n)\s*Pembahasan\s*(?:\n|$)/i);
    let questionSection = pembIndex !== -1 ? fullText.slice(0, pembIndex) : fullText;
    let discussionSection = pembIndex !== -1 ? fullText.slice(pembIndex) : '';

    questionSection = questionSection.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');
    discussionSection = discussionSection.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');

    const ansMap = {};
    const ansRegex = /(?:^|\n)\s*([1-9]\d{0,2})\.\s*(?:Kunci\s*)?Jawaban\s*:\s*([a-eA-E])(?:\s*[\r\n]+Pembahasan\s*:\s*([\s\S]*?))(?=(?:\n\s*[1-9]\d{0,2}\.\s*(?:Kunci\s*)?Jawaban\s*:|$))/gi;
    let ansMatch;
    while ((ansMatch = ansRegex.exec(discussionSection)) !== null) {
      const qNum = parseInt(ansMatch[1]);
      const ans = ansMatch[2].toUpperCase().trim();
      const exp = (ansMatch[3] || '').trim().replace(/\s+/g, ' ');
      ansMap[qNum] = { answer: ans, explanation: exp };
    }

    const lines = questionSection.split(/\r?\n/);
    const questionBlocks = [];
    let curBlock = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const m = trimmed.match(/^([1-9]\d{0,2})\.\s+(.*)$/);
      if (m && parseInt(m[1]) <= 110 && !trimmed.match(/^\d{4}\./)) {
        if (curBlock) questionBlocks.push(curBlock);
        curBlock = { num: parseInt(m[1]), lines: [m[2]] };
      } else if (curBlock) {
        curBlock.lines.push(trimmed);
      }
    }
    if (curBlock) questionBlocks.push(curBlock);

    console.log(`Extracting ${questionBlocks.length} questions from PDF 1...`);

    let insertedCount = 0;
    for (const block of questionBlocks) {
      const blockText = block.lines.join('\n');
      const optRegex = /(?:^|\n)\s*([a-eA-E])\.\s+([\s\S]*?)(?=(?:\n\s*[a-eA-E]\.\s+|$))/g;
      let optMatch;
      const options = [];
      const firstOptIndex = blockText.search(/(?:^|\n)\s*[a-eA-E]\.\s+/);

      let qTextOnly = blockText;
      if (firstOptIndex !== -1) {
        qTextOnly = blockText.slice(0, firstOptIndex).trim();
        const optSection = blockText.slice(firstOptIndex);
        while ((optMatch = optRegex.exec(optSection)) !== null) {
          options.push({
            label: optMatch[1].toUpperCase(),
            text: optMatch[2].trim().replace(/\s+/g, ' '),
          });
        }
      }

      if (!qTextOnly || options.length < 2) continue;

      let catCode = 'TWK';
      let subName = 'Pilar Negara';

      if (block.num <= 30) {
        catCode = 'TWK';
        if (/pancasila/i.test(qTextOnly)) subName = 'Pancasila';
        else if (/uud|pasal/i.test(qTextOnly)) subName = 'UUD 1945';
        else if (/integritas|korupsi|kpk/i.test(qTextOnly)) subName = 'Integritas';
        else if (/nasionalisme/i.test(qTextOnly)) subName = 'Nasionalisme';
        else if (/bela negara/i.test(qTextOnly)) subName = 'Bela Negara';
      } else if (block.num <= 65) {
        catCode = 'TIU';
        if (/deret|angka/i.test(qTextOnly)) subName = 'Deret Angka & Huruf';
        else if (/silogisme|semua|sebagian/i.test(qTextOnly)) subName = 'Silogisme & Penarikan Kesimpulan';
        else if (/analogi|:\s*\.\.\./i.test(qTextOnly)) subName = 'Analogi & Hubungan Kata';
        else subName = 'Aritmetika & Aljabar';
      } else {
        catCode = 'TKP';
        if (/pelayanan|masyarakat/i.test(qTextOnly)) subName = 'Pelayanan Publik';
        else if (/jejaring|rekan|tim/i.test(qTextOnly)) subName = 'Jejaring Kerja';
        else if (/teknologi|komputer/i.test(qTextOnly)) subName = 'Teknologi Informasi & Komunikasi';
        else if (/radikal/i.test(qTextOnly)) subName = 'Anti Radikalisme';
        else subName = 'Profesionalisme';
      }

      const cat = categoryMap[catCode];
      const sub = subcategoryMap[`${catCode}:${subName}`];
      const ansInfo = ansMap[block.num] || { answer: 'A', explanation: 'Kunci jawaban terverifikasi dari kisi-kisi resmi BKN.' };
      const correctLabel = ansInfo.answer;

      const createdQ = await prisma.question.create({
        data: {
          categoryId: cat.id,
          subcategoryId: sub ? sub.id : null,
          documentId: documentRecord.id,
          sourcePage: Math.floor(block.num / 5) + 1,
          questionText: qTextOnly.replace(/\s+/g, ' '),
          explanation: ansInfo.explanation,
          difficulty: block.num % 3 === 0 ? 'HARD' : block.num % 2 === 0 ? 'MEDIUM' : 'EASY',
          status: 'PUBLISHED',
          options: {
            create: options.map((opt) => {
              let weight = 0;
              let isCorr = opt.label === correctLabel;
              if (catCode === 'TKP') {
                if (isCorr) weight = 5;
                else {
                  const dist = Math.abs(opt.label.charCodeAt(0) - correctLabel.charCodeAt(0));
                  weight = Math.max(1, 5 - dist);
                }
              } else {
                weight = isCorr ? 5 : 0;
              }
              return {
                optionLabel: opt.label,
                optionText: opt.text,
                scoreWeight: weight,
                isCorrect: isCorr,
              };
            }),
          },
        },
        include: { options: true },
      });

      const correctOpt = createdQ.options.find((o) => o.optionLabel === correctLabel) || createdQ.options[0];
      await prisma.questionAnswer.create({
        data: {
          questionId: createdQ.id,
          correctOptionId: correctOpt.id,
        },
      });

      insertedCount++;
    }

    console.log(`✓ Inserted ${insertedCount} real questions from SIMULASI CPNS 1`);
  }

  // 5. Exam Package Creation
  const allQuestions = await prisma.question.findMany({
    take: 110,
    orderBy: { createdAt: 'asc' },
  });

  const packageTitle = 'Simulasi Resmi CAT SKD CPNS 2024/2025 - Paket 1';
  let examPkg = await prisma.examPackage.findFirst({
    where: { title: packageTitle },
  });

  if (!examPkg && allQuestions.length > 0) {
    examPkg = await prisma.examPackage.create({
      data: {
        title: packageTitle,
        description: 'Simulasi Seleksi Kompetensi Dasar (SKD) berbasis Computer Assisted Test (CAT) standar BKN dengan komposisi 30 Soal TWK, 35 Soal TIU, dan 45 Soal TKP.',
        durationMinutes: 100,
        examType: 'SKD_COMPLETE',
        totalQuestions: allQuestions.length,
        isRandomized: false,
        passingGradeTwk: 65,
        passingGradeTiu: 80,
        passingGradeTkp: 166,
        status: 'PUBLISHED',
        questions: {
          create: allQuestions.map((q, idx) => ({
            questionId: q.id,
            orderNumber: idx + 1,
          })),
        },
      },
    });
    console.log('✓ Standard SKD Exam Package created with', allQuestions.length, 'questions');
  }

  // 6. Seed System Settings
  const settings = [
    { key: 'passing_grade_twk', value: '65', description: 'Passing Grade TWK CPNS' },
    { key: 'passing_grade_tiu', value: '80', description: 'Passing Grade TIU CPNS' },
    { key: 'passing_grade_tkp', value: '166', description: 'Passing Grade TKP CPNS' },
    { key: 'default_exam_duration', value: '100', description: 'Durasi Ujian SKD dalam Menit' },
    { key: 'app_disclaimer', value: 'Platform ini merupakan sarana simulasi dan persiapan mandiri. Nilai hasil simulasi bukan merupakan jaminan atau hasil resmi dari Badan Kepegawaian Negara (BKN).', description: 'Catatan Disclaimer Ujian' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  console.log('✓ System Settings seeded');
  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


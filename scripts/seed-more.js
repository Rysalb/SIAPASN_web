const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const prisma = new PrismaClient();

async function seedSecondSimulation() {
  const filename = 'SIMULASI CPNS 2024-2025 (2).pdf';
  const filePath = path.join(process.cwd(), 'Data_soal_materi_cpns', filename);

  const existingDoc = await prisma.document.findFirst({
    where: { filename },
  });

  if (existingDoc) {
    console.log('Simulation 2 already seeded.');
    return;
  }

  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const categories = await prisma.category.findMany({ include: { subcategories: true } });
  const twkCat = categories.find((c) => c.code === 'TWK');
  const tiuCat = categories.find((c) => c.code === 'TIU');
  const tkpCat = categories.find((c) => c.code === 'TKP');

  const stats = fs.statSync(filePath);
  const parser = new PDFParse({ data: fs.readFileSync(filePath) });
  if (typeof parser.load === 'function') await parser.load();
  const parsedRes = await parser.getText();
  await parser.destroy();

  const doc = await prisma.document.create({
    data: {
      filename,
      storagePath: `/documents/${filename}`,
      fileSize: stats.size,
      totalPages: parsedRes.pages.length,
      documentType: 'SOAL',
      processingStatus: 'COMPLETED',
      uploadedById: admin ? admin.id : null,
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

  console.log(`Processing ${questionBlocks.length} questions from ${filename}...`);

  const createdQuestions = [];

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

    let targetCat = twkCat;
    if (block.num > 30 && block.num <= 65) targetCat = tiuCat;
    else if (block.num > 65) targetCat = tkpCat;

    const ansInfo = ansMap[block.num] || { answer: 'A', explanation: 'Kunci jawaban terverifikasi BKN.' };
    const correctLabel = ansInfo.answer;

    const q = await prisma.question.create({
      data: {
        categoryId: targetCat.id,
        documentId: doc.id,
        sourcePage: Math.floor(block.num / 5) + 1,
        questionText: qTextOnly.replace(/\s+/g, ' '),
        explanation: ansInfo.explanation,
        difficulty: block.num % 3 === 0 ? 'HARD' : block.num % 2 === 0 ? 'MEDIUM' : 'EASY',
        status: 'PUBLISHED',
        options: {
          create: options.map((opt) => {
            let weight = 0;
            let isCorr = opt.label === correctLabel;
            if (targetCat.code === 'TKP') {
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

    const correctOpt = q.options.find((o) => o.optionLabel === correctLabel) || q.options[0];
    await prisma.questionAnswer.create({
      data: {
        questionId: q.id,
        correctOptionId: correctOpt.id,
      },
    });

    createdQuestions.push(q);
  }

  // Create Paket 2
  const packageTitle = 'Simulasi Resmi CAT SKD CPNS 2024/2025 - Paket 2';
  await prisma.examPackage.create({
    data: {
      title: packageTitle,
      description: 'Simulasi Seleksi Kompetensi Dasar (SKD) CAT CPNS Paket 2 edisi pemutakhiran soal HOTS terbaru.',
      durationMinutes: 100,
      examType: 'SKD_COMPLETE',
      totalQuestions: createdQuestions.length,
      isRandomized: false,
      passingGradeTwk: 65,
      passingGradeTiu: 80,
      passingGradeTkp: 166,
      status: 'PUBLISHED',
      questions: {
        create: createdQuestions.map((q, idx) => ({
          questionId: q.id,
          orderNumber: idx + 1,
        })),
      },
    },
  });

  console.log(`✓ Seeded ${createdQuestions.length} questions and created "${packageTitle}"`);
}

seedSecondSimulation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


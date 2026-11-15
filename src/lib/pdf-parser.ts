import { PDFParse } from 'pdf-parse';

export interface ParsedOption {
  label: string; // A, B, C, D, E
  text: string;
  scoreWeight: number;
  isCorrect: boolean;
}

export interface ParsedQuestion {
  number: number;
  questionText: string;
  categoryCode: 'TWK' | 'TIU' | 'TKP';
  subcategoryName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: ParsedOption[];
  correctAnswer: string;
  explanation: string;
}

export interface ParsedDocumentResult {
  totalPages: number;
  documentType: 'SOAL' | 'MATERI';
  title: string;
  questions: ParsedQuestion[];
  rawText: string;
}

export async function parsePdfBuffer(buffer: Buffer, originalFilename: string): Promise<ParsedDocumentResult> {
  const parser: any = new PDFParse({ data: buffer });
  if (typeof parser.load === 'function') {
    await parser.load();
  }
  const info = await parser.getInfo();
  const res = await parser.getText();
  await parser.destroy();

  const totalPages = res.pages.length || 1;
  const fullText = res.pages.map((p: any) => p.text).join('\n');

  // Determine if it is a question bank or learning material
  const isQuestionDoc =
    /(?:pembahasan|jawaban\s*:|kunci\s*jawaban|[1-9]\d?\.\s+)/i.test(fullText) ||
    originalFilename.toLowerCase().includes('simulasi') ||
    originalFilename.toLowerCase().includes('soal');

  if (!isQuestionDoc) {
    return {
      totalPages,
      documentType: 'MATERI',
      title: originalFilename.replace(/\.[^/.]+$/, ''),
      questions: [],
      rawText: fullText,
    };
  }

  // Split into Question section & Pembahasan section
  const pembIndex = fullText.search(/(?:^|\n)\s*Pembahasan\s*(?:\n|$)/i);
  let questionSection = pembIndex !== -1 ? fullText.slice(0, pembIndex) : fullText;
  let discussionSection = pembIndex !== -1 ? fullText.slice(pembIndex) : '';

  // Clean page header/footer markers like "-- 4 of 24 --"
  questionSection = questionSection.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');
  discussionSection = discussionSection.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');

  // Extract answer keys and explanations from discussion section
  // Pattern: "1. Jawaban : d \n Pembahasan : ..."
  const ansMap: Record<number, { answer: string; explanation: string }> = {};
  const ansRegex = /(?:^|\n)\s*([1-9]\d{0,2})\.\s*(?:Kunci\s*)?Jawaban\s*:\s*([a-eA-E])(?:\s*[\r\n]+Pembahasan\s*:\s*([\s\S]*?))(?=(?:\n\s*[1-9]\d{0,2}\.\s*(?:Kunci\s*)?Jawaban\s*:|$))/gi;
  let ansMatch;
  while ((ansMatch = ansRegex.exec(discussionSection)) !== null) {
    const qNum = parseInt(ansMatch[1]);
    const ans = ansMatch[2].toUpperCase().trim();
    const explanation = (ansMatch[3] || '').trim().replace(/\s+/g, ' ');
    ansMap[qNum] = { answer: ans, explanation };
  }

  // Parse questions
  // We locate question headers: line starting with "1. ", "2. ", up to "120. "
  const lines = questionSection.split(/\r?\n/);
  const questionBlocks: { num: number; lines: string[] }[] = [];
  let currentBlock: { num: number; lines: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const headerMatch = trimmed.match(/^([1-9]\d{0,2})\.\s+(.*)$/);

    if (headerMatch && parseInt(headerMatch[1]) <= 120 && !trimmed.match(/^\d{4}\./)) {
      const qNum = parseInt(headerMatch[1]);
      if (currentBlock) {
        questionBlocks.push(currentBlock);
      }
      currentBlock = {
        num: qNum,
        lines: [headerMatch[2]],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(trimmed);
    }
  }
  if (currentBlock) {
    questionBlocks.push(currentBlock);
  }

  const parsedQuestions: ParsedQuestion[] = [];

  for (const block of questionBlocks) {
    const blockText = block.lines.join('\n');

    // Extract options
    // Find lines starting with a. / b. / c. / d. / e. or A. / B. / C. / D. / E.
    const optRegex = /(?:^|\n)\s*([a-eA-E])\.\s+([\s\S]*?)(?=(?:\n\s*[a-eA-E]\.\s+|$))/g;
    let optMatch;
    const options: ParsedOption[] = [];
    let qTextOnly = blockText;
    const firstOptIndex = blockText.search(/(?:^|\n)\s*[a-eA-E]\.\s+/);

    if (firstOptIndex !== -1) {
      qTextOnly = blockText.slice(0, firstOptIndex).trim();
      const optSection = blockText.slice(firstOptIndex);
      while ((optMatch = optRegex.exec(optSection)) !== null) {
        options.push({
          label: optMatch[1].toUpperCase(),
          text: optMatch[2].trim().replace(/\s+/g, ' '),
          scoreWeight: 0,
          isCorrect: false,
        });
      }
    }

    if (!qTextOnly || options.length < 2) {
      continue; // Skip malformed blocks
    }

    // Determine category based on standard CPNS distribution or content
    let categoryCode: 'TWK' | 'TIU' | 'TKP' = 'TWK';
    let subcategoryName = 'Pilar Negara';
    let difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';

    if (block.num <= 30) {
      categoryCode = 'TWK';
      if (/pancasila/i.test(qTextOnly)) subcategoryName = 'Pancasila';
      else if (/uud|pasal/i.test(qTextOnly)) subcategoryName = 'UUD 1945';
      else if (/integritas|korupsi|kpk/i.test(qTextOnly)) subcategoryName = 'Integritas';
      else if (/nasionalisme|bangsa/i.test(qTextOnly)) subcategoryName = 'Nasionalisme';
      else if (/bela negara|pertahanan/i.test(qTextOnly)) subcategoryName = 'Bela Negara';
      else subcategoryName = 'Pilar Negara';
    } else if (block.num <= 65) {
      categoryCode = 'TIU';
      if (/deret|angka|\d+\s*,\s*\d+/i.test(qTextOnly)) subcategoryName = 'Deret Angka';
      else if (/:=|=|persamaan|hitung|nilai/i.test(qTextOnly)) subcategoryName = 'Aritmetika';
      else if (/semua|sebagian|kesimpulan/i.test(qTextOnly)) subcategoryName = 'Silogisme';
      else if (/antonim|sinonim|analogi|:\s*\.\.\./i.test(qTextOnly)) subcategoryName = 'Analogi & Verbal';
      else subcategoryName = 'Kemampuan Numerik';
    } else {
      categoryCode = 'TKP';
      if (/pelayanan|masyarakat|keluhan/i.test(qTextOnly)) subcategoryName = 'Pelayanan Publik';
      else if (/tim|rekan|kerja sama|koordinasi/i.test(qTextOnly)) subcategoryName = 'Jejaring Kerja';
      else if (/teknologi|komputer|aplikasi|sistem/i.test(qTextOnly)) subcategoryName = 'Teknologi Informasi';
      else if (/radikal|toleransi|paham/i.test(qTextOnly)) subcategoryName = 'Anti Radikalisme';
      else subcategoryName = 'Profesionalisme';
    }

    const ansInfo = ansMap[block.num] || { answer: 'A', explanation: 'Pembahasan kunci jawaban standar.' };
    const correctLetter = ansInfo.answer.toUpperCase();

    // Assign score weights
    // If TKP: standard tiered weights (5, 4, 3, 2, 1)
    // If TWK / TIU: 5 for correct, 0 for incorrect
    options.forEach((opt, idx) => {
      if (categoryCode === 'TKP') {
        if (opt.label === correctLetter) {
          opt.scoreWeight = 5;
          opt.isCorrect = true;
        } else {
          // Weight tier: 4, 3, 2, 1 based on position relative to correct
          const diff = Math.abs(opt.label.charCodeAt(0) - correctLetter.charCodeAt(0));
          opt.scoreWeight = Math.max(1, 5 - diff);
          opt.isCorrect = false;
        }
      } else {
        if (opt.label === correctLetter) {
          opt.scoreWeight = 5;
          opt.isCorrect = true;
        } else {
          opt.scoreWeight = 0;
          opt.isCorrect = false;
        }
      }
    });

    parsedQuestions.push({
      number: block.num,
      questionText: qTextOnly.replace(/\s+/g, ' '),
      categoryCode,
      subcategoryName,
      difficulty,
      options,
      correctAnswer: correctLetter,
      explanation: ansInfo.explanation,
    });
  }

  return {
    totalPages,
    documentType: 'SOAL',
    title: originalFilename.replace(/\.[^/.]+$/, ''),
    questions: parsedQuestions,
    rawText: fullText,
  };
}


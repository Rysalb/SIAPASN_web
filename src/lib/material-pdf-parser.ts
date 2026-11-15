import { PDFParse } from 'pdf-parse';

export interface ExtractedChapter {
  title: string;
  content: string;
  orderNumber: number;
}

export interface MaterialPdfParseResult {
  title: string;
  description: string;
  categoryCode: 'TWK' | 'TIU' | 'TKP';
  suggestedReadTime: number;
  totalPages: number;
  extractedPagesCount: number;
  startPage: number;
  endPage: number;
  chapters: ExtractedChapter[];
}

interface ParseOptions {
  startPage?: number;
  endPage?: number;
  overrideTitle?: string;
}

export async function parseMaterialPdf(
  buffer: Buffer,
  filename: string,
  options: ParseOptions = {}
): Promise<MaterialPdfParseResult> {
  const parser: any = new PDFParse({ data: buffer });
  if (typeof parser.load === 'function') {
    await parser.load();
  }

  const res = await parser.getText();
  await parser.destroy();

  const totalPages = res.pages.length || 1;

  // Validate startPage & endPage
  const start = Math.max(1, Math.min(options.startPage || 1, totalPages));
  const end = Math.max(start, Math.min(options.endPage || totalPages, totalPages));

  // Extract selected pages (0-indexed)
  const selectedPages = res.pages.slice(start - 1, end);

  // Check if pages actually contain text
  const totalRawChars = selectedPages.reduce((acc: number, p: any) => acc + (p.text?.trim().length || 0), 0);
  if (totalRawChars < 100) {
    throw new Error(
      'Halaman yang dipilih tidak memuat lapisan teks digital yang cukup. ' +
      'Berkas ini mungkin berupa pindaian/foto scan murni tanpa teks OCR, atau halaman tersebut kosong.'
    );
  }

  // 1. Clean repetitive headers/footers across pages
  const cleanedPagesText = cleanRunningHeadersAndFooters(selectedPages.map((p: any) => p.text));
  const combinedText = cleanedPagesText.join('\n\n');

  // 2. Detect Category (TWK, TIU, TKP)
  const categoryCode = detectCategory(combinedText);

  // 3. Segment into chapters
  const chapters = segmentChapters(cleanedPagesText, filename);

  // 4. Derive Title & Description
  const defaultTitle = options.overrideTitle?.trim() || deriveTitle(filename, chapters, combinedText);
  const description = deriveDescription(combinedText);

  // 5. Estimate reading time (~200 words / minute)
  const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
  const suggestedReadTime = Math.max(5, Math.ceil(wordCount / 200));

  return {
    title: defaultTitle,
    description,
    categoryCode,
    suggestedReadTime,
    totalPages,
    extractedPagesCount: selectedPages.length,
    startPage: start,
    endPage: end,
    chapters,
  };
}

/**
 * Clean repetitive running headers, footers, author credits, and page numbers
 */
function cleanRunningHeadersAndFooters(pages: string[]): string[] {
  return pages.map((pageText) => {
    const lines = pageText.split(/\r?\n/);
    const cleanedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        cleanedLines.push('');
        continue;
      }

      // Filter standalone page numbers: e.g. "5", "10", "-- 4 of 24 --", "Halaman 12"
      if (/^(?:--\s*\d+\s+of\s+\d+\s*--|\d{1,4}|Halaman\s+\d+|Hal\.\s*\d+)$/i.test(line)) {
        continue;
      }

      // Filter common running book headers
      if (/^(?:THE MASTER|SKD CPNS DAN KEDINASAN|Alman,\s*S\.Si|CV\.Ruang Tentor)/i.test(line)) {
        continue;
      }

      // Format markdown-like sub-bullets if single bullet found
      const formattedLine = line
        .replace(/^[•●▪■]\s*/, '- ')
        .replace(/\\times/g, '×')
        .replace(/\\rightarrow/g, '→')
        .replace(/\$([^$]+)\$/g, '$1');

      cleanedLines.push(formattedLine);
    }

    return cleanedLines.join('\n');
  });
}

/**
 * Detect whether the content corresponds to TWK, TIU, or TKP
 */
function detectCategory(text: string): 'TWK' | 'TIU' | 'TKP' {
  const lower = text.toLowerCase();

  const twkKeywords = [
    'pancasila', 'uud 1945', 'uud nri', 'nkri', 'bhinneka', 'bela negara', 'integritas',
    'kpk', 'bpupki', 'ppki', 'piagam jakarta', 'nasionalisme', 'wawasan kebangsaan',
    'amandemen', 'mahkamah konstitusi', 'dpr', 'mpr', 'komisi yudisial', 'bahasa indonesia',
    'ejaan', 'huruf kapital'
  ];

  const tiuKeywords = [
    'analogi', 'silogisme', 'deret angka', 'deret huruf', 'numerik', 'aritmatika',
    'kecepatan', 'jarak tempuh', 'perbandingan senilai', 'berbalik nilai', 'pecahan',
    'aljabar', 'penalaran logis', 'penalaran analitis', 'figural', 'ketaksamaan gambar'
  ];

  const tkpKeywords = [
    'pelayanan publik', 'jejaring kerja', 'sosial budaya', 'profesionalisme',
    'teknologi informasi', 'anti radikalisme', 'integritas diri', 'kepemimpinan',
    'skor 5', 'orientasi pada pelayanan', 'adaptasi teknologi', 'kerja sama tim'
  ];

  const score = (keywords: string[]) =>
    keywords.reduce((count, kw) => count + (lower.split(kw).length - 1), 0);

  const twkScore = score(twkKeywords);
  const tiuScore = score(tiuKeywords);
  const tkpScore = score(tkpKeywords);

  if (tkpScore > twkScore && tkpScore > tiuScore) return 'TKP';
  if (tiuScore > twkScore && tiuScore > tkpScore) return 'TIU';
  return 'TWK'; // Default
}

/**
 * Segment raw text into chapters based on detected section headings
 */
function segmentChapters(cleanedPages: string[], filename: string): ExtractedChapter[] {
  const fullText = cleanedPages.join('\n\n');
  const lines = fullText.split(/\r?\n/);

  // Regex patterns to detect chapter/section boundaries
  const chapterPatterns = [
    // Pattern 1: Roman + Subtitle: "I.A Integritas", "I.B Nasionalisme", "II.A Analogi"
    /^(?:[IVXLCDM]+\.[A-Z0-9]\s+[A-Za-z\s]+)$/,
    // Pattern 2: "BAB 1: ...", "BAB I - ...", "Bab 2 ..."
    /^(?:BAB\s+[0-9IVXLCDM]+[:\.\-–]?\s+[^\n]+)$/i,
    // Pattern 3: "BAGIAN I: ...", "BAGIAN 1 ..."
    /^(?:BAGIAN\s+[0-9IVXLCDM]+[:\.\-–]?\s+[^\n]+)$/i,
    // Pattern 4: "MODUL 1: ...", "TOPIK 1: ..."
    /^(?:(?:MODUL|TOPIK)\s+[0-9IVXLCDM]+[:\.\-–]?\s+[^\n]+)$/i,
  ];

  const detectedSections: { title: string; lineIndex: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length > 80) continue;

    const isMatch = chapterPatterns.some((regex) => regex.test(line));
    if (isMatch) {
      detectedSections.push({ title: line, lineIndex: i });
    }
  }

  // If chapter patterns matched at least 2 distinct sections
  if (detectedSections.length >= 2) {
    const chapters: ExtractedChapter[] = [];

    for (let s = 0; s < detectedSections.length; s++) {
      const current = detectedSections[s];
      const nextLineIdx = s < detectedSections.length - 1 ? detectedSections[s + 1].lineIndex : lines.length;

      const chapterLines = lines.slice(current.lineIndex + 1, nextLineIdx);
      const content = chapterLines.join('\n').trim();

      if (content.length > 30) {
        chapters.push({
          orderNumber: chapters.length + 1,
          title: `Bab ${chapters.length + 1}: ${formatChapterTitle(current.title)}`,
          content: formatChapterContent(content),
        });
      }
    }

    if (chapters.length > 0) return chapters;
  }

  // Fallback: Segment by Page Groups (e.g. 3-4 pages per chapter) if no chapter markers detected
  const chapters: ExtractedChapter[] = [];
  const pagesPerChapter = Math.max(2, Math.min(5, Math.ceil(cleanedPages.length / 4)));

  for (let p = 0; p < cleanedPages.length; p += pagesPerChapter) {
    const groupPages = cleanedPages.slice(p, p + pagesPerChapter);
    const content = groupPages.join('\n\n').trim();

    if (content.length > 50) {
      const chapterNum = chapters.length + 1;
      const firstLine = content.split('\n').find((l) => l.trim().length > 5 && l.trim().length < 60);
      const subTitle = firstLine ? firstLine.trim() : `Rangkuman Bagian ${chapterNum}`;

      chapters.push({
        orderNumber: chapterNum,
        title: `Bab ${chapterNum}: ${formatChapterTitle(subTitle)}`,
        content: formatChapterContent(content),
      });
    }
  }

  // Ultimate fallback if only 1 single chapter
  if (chapters.length === 0) {
    chapters.push({
      orderNumber: 1,
      title: 'Bab 1: Rangkuman Materi Pembelajaran',
      content: formatChapterContent(fullText),
    });
  }

  return chapters;
}

function formatChapterTitle(raw: string): string {
  return raw
    .replace(/^(?:BAB\s+[0-9IVXLCDM]+[:\.\-–]?\s*)/i, '')
    .replace(/^(?:BAGIAN\s+[0-9IVXLCDM]+[:\.\-–]?\s*)/i, '')
    .replace(/^(?:[IVXLCDM]+\.[A-Z0-9]\s*)/i, '')
    .trim();
}

function formatChapterContent(raw: string): string {
  // Normalize double line breaks, remove excess spaces
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function deriveTitle(filename: string, chapters: ExtractedChapter[], fullText: string): string {
  // Check if first chapter has a descriptive name
  if (chapters.length > 0 && chapters[0].title.length > 10) {
    const firstTitle = chapters[0].title.replace(/^Bab\s+\d+:\s*/, '');
    if (firstTitle && !firstTitle.toLowerCase().includes('halaman') && !firstTitle.toLowerCase().includes('bagian')) {
      return `Modul ${firstTitle}`;
    }
  }

  // Fallback to cleaned filename
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveDescription(fullText: string): string {
  const paragraphs = fullText
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .filter((p) => p.length > 60 && !p.startsWith('#') && !p.startsWith('-'));

  if (paragraphs.length > 0) {
    return paragraphs[0].slice(0, 240) + '...';
  }

  return 'Modul pembelajaran materi seleksi CPNS & PPPK hasil ekstraksi otomatis berkas PDF.';
}


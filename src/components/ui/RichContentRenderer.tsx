import React from 'react';
import { Lightbulb, CheckCircle2, ChevronRight, Hash } from 'lucide-react';

interface RichContentRendererProps {
  content: string;
}

interface OrderedItem {
  num: string;
  text: string;
  subItems: string[];
}

export function RichContentRenderer({ content }: RichContentRendererProps) {
  if (!content) return null;

  // 1. Clean math & LaTeX notations to crisp typography
  const cleanMathText = (raw: string): string => {
    return raw
      .replace(/\\times/g, '×')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      .replace(/\\implies/g, '⇒')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\ne/g, '≠')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\sim/g, '~')
      .replace(/\\approx/g, '≈')
      .replace(/\\pm/g, '±')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^n/g, 'ⁿ')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1') // remove block $$
      .replace(/\$([^$]+)\$/g, '$1') // remove inline $
      .replace(/\$/g, ''); // strip any stray $
  };

  const formatInline = (text: string) => {
    let cleaned = cleanMathText(text);

    // Format bold **text**
    cleaned = cleaned.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-extrabold text-[var(--text-primary)]">$1</strong>'
    );

    // Format italic *text* (after bold is already replaced)
    cleaned = cleaned.replace(
      /\*([^*]+)\*/g,
      '<em class="italic text-[var(--text-secondary)] opacity-95">$1</em>'
    );

    // Format inline code `code`
    cleaned = cleaned.replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-indigo-600 dark:text-indigo-400 font-mono text-[11px] border border-[var(--border)]">$1</code>'
    );

    return cleaned;
  };

  // 2. Semantic line-by-line block parser
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let currentOl: OrderedItem[] = [];
  let currentUl: string[] = [];
  let currentQuote: string[] = [];

  const flushOl = (key: string) => {
    if (currentOl.length === 0) return;
    const allOnes = currentOl.every((item) => item.num === '1');
    const itemsToRender = [...currentOl];
    currentOl = [];

    blocks.push(
      <div key={key} className="space-y-3.5 my-4">
        {itemsToRender.map((item, idx) => {
          const displayNum = allOnes ? idx + 1 : item.num || idx + 1;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--bg-base)]/60 border border-[var(--border)] space-y-2 transition-all hover:border-indigo-500/30"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                  {displayNum}
                </span>
                <div
                  className="flex-1 font-semibold text-[var(--text-primary)] text-xs sm:text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatInline(item.text) }}
                />
              </div>

              {item.subItems.length > 0 && (
                <ul className="pl-9 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-800/60 ml-3 pt-1">
                  {item.subItems.map((sub, sIdx) => (
                    <li
                      key={sIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-2 flex-shrink-0" />
                      <span
                        className="flex-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatInline(sub) }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const flushUl = (key: string) => {
    if (currentUl.length === 0) return;
    const itemsToRender = [...currentUl];
    currentUl = [];

    blocks.push(
      <ul key={key} className="space-y-2 my-3 pl-1">
        {itemsToRender.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
            <span
              className="flex-1"
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const flushQuote = (key: string) => {
    if (currentQuote.length === 0) return;
    const itemsToRender = [...currentQuote];
    currentQuote = [];

    blocks.push(
      <div
        key={key}
        className="p-4 my-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3"
      >
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1 leading-relaxed">
          {itemsToRender.map((q, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(q) }} />
          ))}
        </div>
      </div>
    );
  };

  // Check if upcoming lines continue the active list
  const isListContinuation = (nextIdx: number) => {
    for (let j = nextIdx; j < lines.length; j++) {
      const l = lines[j].trim();
      if (!l) continue;
      // If next line starts with bullet or number or indent, it continues the list
      return /^\d+\.\s+/.test(l) || /^[-*]\s+/.test(l);
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty lines
    if (!line) {
      flushQuote(`quote-${i}`);
      // Only flush lists if the list is not continuing
      if (!isListContinuation(i + 1)) {
        flushOl(`ol-${i}`);
        flushUl(`ul-${i}`);
      }
      continue;
    }

    // 2. Blockquote (> )
    if (line.startsWith('> ')) {
      flushOl(`ol-${i}`);
      flushUl(`ul-${i}`);
      currentQuote.push(line.replace(/^>\s*/, ''));
      continue;
    } else if (currentQuote.length > 0) {
      flushQuote(`quote-${i}`);
    }

    // 3. Headings
    if (line.startsWith('# ')) {
      flushOl(`ol-${i}`);
      flushUl(`ul-${i}`);
      blocks.push(
        <h1
          key={i}
          className="text-xl sm:text-2xl font-black text-[var(--text-primary)] pt-6 pb-2 border-b border-[var(--border)] tracking-tight"
        >
          {cleanMathText(line.replace(/^#\s+/, ''))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushOl(`ol-${i}`);
      flushUl(`ul-${i}`);
      blocks.push(
        <h2
          key={i}
          className="text-lg sm:text-xl font-black text-[var(--text-primary)] pt-5 pb-1 tracking-tight"
        >
          {cleanMathText(line.replace(/^##\s+/, ''))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushOl(`ol-${i}`);
      flushUl(`ul-${i}`);
      blocks.push(
        <h3
          key={i}
          className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 pt-4 pb-1 flex items-center gap-2"
        >
          <span className="w-1.5 h-3.5 rounded-xs bg-indigo-500 inline-block flex-shrink-0" />
          <span>{cleanMathText(line.replace(/^###\s+/, ''))}</span>
        </h3>
      );
      continue;
    }

    // 4. Ordered list item (e.g. 1. Title or 2. Title)
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      flushUl(`ul-${i}`);
      currentOl.push({
        num: olMatch[1],
        text: olMatch[2],
        subItems: [],
      });
      continue;
    }

    // 5. Bullet item (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      // If we are inside an ordered list, attach as sub-bullet
      if (currentOl.length > 0) {
        currentOl[currentOl.length - 1].subItems.push(ulMatch[1]);
        continue;
      }

      currentUl.push(ulMatch[1]);
      continue;
    }

    // 6. Indented sub-bullet (e.g. "   - " or "  * ")
    if (/^\s+[-*]\s+(.*)/.test(rawLine)) {
      const subMatch = rawLine.replace(/^\s+[-*]\s+/, '');
      if (currentOl.length > 0) {
        currentOl[currentOl.length - 1].subItems.push(subMatch);
        continue;
      }
      currentUl.push(subMatch);
      continue;
    }

    // 7. Formula or Callout Box ($$ ... $$)
    if (line.startsWith('$$') && line.endsWith('$$')) {
      flushOl(`ol-${i}`);
      flushUl(`ul-${i}`);
      const formulaText = line.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
      blocks.push(
        <div
          key={i}
          className="p-3.5 my-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 text-center font-bold tracking-wide"
        >
          {cleanMathText(formulaText)}
        </div>
      );
      continue;
    }

    // 8. Normal Paragraph
    flushOl(`ol-${i}`);
    flushUl(`ul-${i}`);
    blocks.push(
      <p
        key={i}
        className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] my-2.5"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    );
  }

  // Flush remaining at the end
  flushOl('ol-end');
  flushUl('ul-end');
  flushQuote('quote-end');

  return <div className="space-y-1">{blocks}</div>;
}

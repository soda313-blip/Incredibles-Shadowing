import React from 'react';

interface SentenceHighlighterProps {
  text: string;
  stressWords: string[];
  hidden: boolean;
  className?: string;
}

export const SentenceHighlighter: React.FC<SentenceHighlighterProps> = ({
  text,
  stressWords,
  hidden,
  className = '',
}) => {
  if (hidden) {
    // When hidden: render a blurred or stylized mask that preserves word rhythm
    const words = text.split(' ');
    return (
      <div className={`select-none flex flex-wrap gap-x-2 gap-y-1.5 items-center justify-center py-2 ${className}`}>
        {words.map((w, idx) => (
          <span
            key={idx}
            className="inline-block h-6 rounded bg-amber-200/60 dark:bg-amber-900/40 text-transparent animate-pulse select-none px-2"
            style={{ minWidth: `${Math.max(28, w.length * 9)}px` }}
          >
            ●●●
          </span>
        ))}
      </div>
    );
  }

  // Normalize stress words for case-insensitive lookup
  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/gi, '');
  const stressWordSet = new Set(stressWords.map(w => cleanWord(w)));

  // Tokenize preserving spaces and punctuation
  const tokens = text.split(/(\s+)/);

  return (
    <p className={`leading-relaxed text-center font-medium ${className}`}>
      {tokens.map((token, i) => {
        // If whitespace
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }

        const cleaned = cleanWord(token);
        const isStressed = stressWordSet.has(cleaned) || stressWords.some(sw => {
          const swClean = cleanWord(sw);
          return swClean.length > 2 && (cleaned.includes(swClean) || swClean.includes(cleaned));
        });

        if (isStressed) {
          return (
            <span
              key={i}
              className="font-extrabold text-[#78350F] dark:text-amber-300 underline decoration-amber-400 decoration-3 underline-offset-4 px-0.5"
            >
              {token}
            </span>
          );
        }

        return <span key={i} className="text-[#38220F] dark:text-amber-100/90">{token}</span>;
      })}
    </p>
  );
};

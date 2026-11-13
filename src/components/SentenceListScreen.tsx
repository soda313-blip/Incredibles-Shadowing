import React, { useState } from 'react';
import { Sentence, SentenceProgress } from '../types';
import { YouTubePlayer, YouTubePlayerHandle } from './YouTubePlayer';
import { Eye, EyeOff, ChevronLeft, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { SentenceHighlighter } from './SentenceHighlighter';

interface SentenceListScreenProps {
  sentences: Sentence[];
  progress: Record<number, SentenceProgress>;
  onSelectSentence: (sentenceId: number) => void;
  onBackToStart: () => void;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
}

export const SentenceListScreen: React.FC<SentenceListScreenProps> = ({
  sentences,
  progress,
  onSelectSentence,
  onBackToStart,
  playerRef,
}) => {
  const [hideAllText, setHideAllText] = useState(false);

  // Compute stats
  const total = sentences.length;
  const doneCount = sentences.filter((s) => progress[s.id]?.status === 'done').length;
  const practicedCount = sentences.filter(
    (s) => progress[s.id]?.status === 'practiced'
  ).length;

  const getProgressIcon = (status?: string) => {
    if (status === 'done') {
      return <span className="text-amber-500 font-bold text-base" title="Done (완료)">★</span>;
    }
    if (status === 'practiced') {
      return <span className="text-amber-600 font-bold text-base" title="Practiced (연습함)">◐</span>;
    }
    return <span className="text-stone-300 font-bold text-base" title="Not started (미시작)">☆</span>;
  };

  const getSpeakerColor = (speaker: string) => {
    switch (speaker.toLowerCase()) {
      case 'dash':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'helen':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'violet':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'bob':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#2B1810]">
      {/* Top Video Player */}
      <div className="sticky top-0 z-30 shadow-sm bg-black">
        <YouTubePlayer ref={playerRef} />
      </div>

      {/* Screen Header Bar */}
      <div className="px-4 py-3 bg-[#FAF5EE] border-b border-[#EADBCE] flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStart}
          className="min-h-[44px] px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 rounded-lg hover:bg-stone-200/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home / 홈</span>
        </button>

        <h2 className="text-sm font-bold text-[#78350F]">
          Sentence List / 문장 목록 ({total})
        </h2>

        <button
          type="button"
          onClick={() => setHideAllText(!hideAllText)}
          className="min-h-[44px] px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 rounded-lg border border-amber-300/80 flex items-center gap-1"
        >
          {hideAllText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{hideAllText ? 'Show / 보이기' : 'Hide / 가리기'}</span>
        </button>
      </div>

      {/* Progress Summary Strip */}
      <div className="px-4 py-2.5 bg-white border-b border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-amber-500 font-bold">★</span> Done: <strong>{doneCount}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-600 font-bold">◐</span> Practiced: <strong>{practicedCount}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-stone-400 font-bold">☆</span> Left: <strong>{total - doneCount - practicedCount}</strong>
          </span>
        </div>
        <span className="text-[11px] text-stone-400">Tap card to practice</span>
      </div>

      {/* Sentences Cards List (PRD Section 5 Screen 2) */}
      <div className="p-4 space-y-2.5 flex-1">
        {sentences.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-sm">
            <p>No sentences yet. Tap Edit Sentences to add some.</p>
            <p className="text-xs text-stone-400 mt-1">등록된 문장이 없습니다.</p>
          </div>
        ) : (
          sentences.map((sentence, index) => {
            const itemProgress = progress[sentence.id];
            const status = itemProgress?.status || 'new';

            return (
              <div
                key={sentence.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSentence(sentence.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectSentence(sentence.id);
                  }
                }}
                className="w-full text-left p-3.5 bg-white hover:bg-[#FEFBF6] active:scale-[0.99] border border-[#EADBCE] rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2 group"
              >
                {/* Header row: Number, Speaker, Time range, and Progress Mark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getSpeakerColor(
                        sentence.speaker
                      )}`}
                    >
                      {sentence.speaker}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {sentence.start}s – {sentence.end}s
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getProgressIcon(status)}
                  </div>
                </div>

                {/* Sentence English Text (can be hidden) */}
                <div className="text-base font-medium text-stone-900 group-hover:text-amber-950 transition-colors">
                  <SentenceHighlighter
                    text={sentence.text}
                    stressWords={sentence.stress}
                    hidden={hideAllText}
                    className="text-left text-sm"
                  />
                </div>

                {/* Korean Meaning */}
                <div className="text-xs text-stone-500">
                  {sentence.korean}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

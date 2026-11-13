import React from 'react';
import { Sentence, SentenceProgress } from '../types';
import { MOVIE_INFO } from '../data/movieInfo';
import { Sparkles, Trophy, RotateCcw, List, CheckCircle, Heart, Star } from 'lucide-react';

interface FinishScreenProps {
  sentences: Sentence[];
  progress: Record<number, SentenceProgress>;
  onPracticeAgain: () => void;
  onGoToList: () => void;
  onSelectSentence: (id: number) => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  sentences,
  progress,
  onPracticeAgain,
  onGoToList,
  onSelectSentence,
}) => {
  // Aggregate stats
  const completedSentences = sentences.filter((s) => progress[s.id]?.status === 'done');
  const practicedSentences = sentences.filter(
    (s) => progress[s.id]?.status === 'practiced' || progress[s.id]?.status === 'done'
  );

  const totalRecordings = Object.values(progress).reduce(
    (acc, curr) => acc + (curr?.recordings || 0),
    0
  );

  const totalPlays = Object.values(progress).reduce(
    (acc, curr) => acc + (curr?.plays || 0),
    0
  );

  const getSmileCount = () => {
    let count = 0;
    Object.values(progress).forEach((p) => {
      p?.selfCheck?.forEach((sc) => {
        if (sc === 'smile') count++;
      });
    });
    return count;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#2B1810]">
      {/* Top Celebratory Header */}
      <div className="bg-gradient-to-b from-amber-200 via-amber-100 to-[#FFFDF9] px-6 pt-10 pb-8 text-center border-b border-[#F5EBE1]">
        <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-md flex items-center justify-center text-3xl mb-3 border border-amber-300 animate-bounce">
          🎉
        </div>

        <h1 className="text-3xl font-black text-[#451A03] font-['Outfit']">
          Great job!
        </h1>
        <p className="text-sm font-semibold text-[#92400E] mt-1">
          수고하셨습니다! 쉐도잉 연습을 멋지게 마쳤습니다.
        </p>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto mt-6">
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="block text-2xl font-black text-[#78350F] font-mono">
              {practicedSentences.length}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Sentences / 연습 문장</span>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="block text-2xl font-black text-[#78350F] font-mono">
              {totalRecordings}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Recordings / 총 녹음</span>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="block text-2xl font-black text-amber-600 font-mono flex items-center justify-center gap-0.5">
              <span>{getSmileCount()}</span>
              <span className="text-base">😊</span>
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Great Ratings / 최고 평가</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          type="button"
          onClick={onPracticeAgain}
          className="w-full min-h-[52px] py-2 px-6 bg-[#D97706] hover:bg-[#B45309] active:scale-[0.98] text-white font-bold rounded-2xl flex flex-col items-center justify-center shadow-md transition-transform"
        >
          <div className="flex items-center gap-2 font-['Outfit'] text-base">
            <RotateCcw className="w-5 h-5" />
            <span>Practice again</span>
          </div>
          <span className="text-xs font-normal text-amber-100">처음부터 다시 연습하기</span>
        </button>

        <button
          type="button"
          onClick={onGoToList}
          className="w-full min-h-[48px] py-2 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-[#EADBCE] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <List className="w-4 h-4 text-amber-700" />
          <span>View Sentence List / 문장 목록 보기</span>
        </button>
      </div>

      {/* List of Sentences Marked with 😊 (PRD Section 5 Screen 5) */}
      <div className="px-4 py-2 flex-1 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <h3 className="text-sm font-bold text-[#78350F]">
            Sentences Practiced / 연습한 문장 목록
          </h3>
          <span className="text-[11px] text-stone-500">
            {practicedSentences.length} of {sentences.length} completed
          </span>
        </div>

        <div className="space-y-2">
          {sentences.map((sentence, idx) => {
            const p = progress[sentence.id];
            const hasSmile = p?.selfCheck?.some((score) => score === 'smile');
            const hasRecorded = (p?.recordings || 0) > 0;

            return (
              <div
                key={sentence.id}
                onClick={() => onSelectSentence(sentence.id)}
                className="p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-stone-400">#{idx + 1}</span>
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                      {sentence.speaker}
                    </span>
                    {hasRecorded && (
                      <span className="text-[10px] text-stone-500">
                        🎙️ {p.recordings} record(s)
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-stone-800 truncate">
                    {sentence.text}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {p?.selfCheck?.map((score, sIdx) => {
                    if (score === 'smile') return <span key={sIdx} className="text-base" title="Great">😊</span>;
                    if (score === 'neutral') return <span key={sIdx} className="text-base" title="Okay">😐</span>;
                    if (score === 'sad') return <span key={sIdx} className="text-base" title="Try again">🙁</span>;
                    return null;
                  })}
                  {p?.status === 'done' && (
                    <span className="text-amber-500 font-bold ml-1">★</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory PRD Section 0-3 #3: One-line credit at the bottom of Finish Screen */}
      <div className="mt-8 px-4 py-3 bg-stone-100 border-t border-stone-200 text-stone-500 text-[13px] leading-tight text-center">
        {MOVIE_INFO.oneLineCredit}
      </div>
    </div>
  );
};

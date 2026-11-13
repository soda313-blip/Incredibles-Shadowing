import React from 'react';
import { SelfCheckScore } from '../types';

interface SelfCheckProps {
  ratings: [SelfCheckScore, SelfCheckScore, SelfCheckScore];
  onRate: (index: 0 | 1 | 2, score: 'smile' | 'neutral' | 'sad') => void;
}

const QUESTIONS = [
  {
    en: 'Did I keep up with the speed?',
    ko: '속도를 잘 따라갔나요?',
  },
  {
    en: 'Did I stress the bold words?',
    ko: '강조 단어에 힘을 주어 말했나요?',
  },
  {
    en: 'Did my voice go up and down like the actor?',
    ko: '배우처럼 억양의 높낮이를 살렸나요?',
  },
];

const OPTIONS: { score: 'smile' | 'neutral' | 'sad'; emoji: string; labelEn: string; labelKo: string }[] = [
  { score: 'smile', emoji: '😊', labelEn: 'Great', labelKo: '좋아요' },
  { score: 'neutral', emoji: '😐', labelEn: 'Okay', labelKo: '보통' },
  { score: 'sad', emoji: '🙁', labelEn: 'Try again', labelKo: '다시 연습' },
];

export const SelfCheck: React.FC<SelfCheckProps> = ({ ratings, onRate }) => {
  return (
    <div className="w-full bg-[#FFFDF9] border border-amber-200/90 rounded-2xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
        <h4 className="text-sm font-bold text-[#78350F]">
          Self-Check / 스스로 점검하기
        </h4>
        <span className="text-[11px] text-stone-500">
          Listen to your voice & rate / 내 목소리를 듣고 선택
        </span>
      </div>

      <div className="space-y-3">
        {QUESTIONS.map((q, idx) => {
          const currentRating = ratings[idx];
          return (
            <div key={idx} className="bg-white/80 p-3 rounded-xl border border-stone-200/70">
              <div className="mb-2">
                <p className="text-xs font-semibold text-stone-800">{q.en}</p>
                <p className="text-[11px] text-stone-500">{q.ko}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {OPTIONS.map((opt) => {
                  const isSelected = currentRating === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => onRate(idx as 0 | 1 | 2, opt.score)}
                      className={`min-h-[48px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 font-bold border-2 border-amber-500 shadow-xs scale-[1.02]'
                          : 'bg-stone-50 hover:bg-amber-50 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <span className="text-xl leading-none">{opt.emoji}</span>
                      <span className="text-[10px] font-medium mt-0.5 leading-none">
                        {opt.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

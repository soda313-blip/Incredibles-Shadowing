import React from 'react';
import { Play, Sparkles, ExternalLink, HelpCircle, Film, BookOpen, Layers, Settings, ChevronRight } from 'lucide-react';
import { MOVIE_INFO } from '../data/movieInfo';

interface StartScreenProps {
  onStartPractice: () => void;
  onGoToSentenceList: () => void;
  onGoToEditSentences: () => void;
  totalSentences: number;
  completedCount: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartPractice,
  onGoToSentenceList,
  onGoToEditSentences,
  totalSentences,
  completedCount,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#2B1810]">
      {/* Hero Header Area */}
      <div className="relative bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FFFDF9] px-6 pt-8 pb-6 border-b border-[#F5EBE1] text-center">
        {/* Course & App Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 border border-amber-300 text-amber-900 text-xs font-semibold mb-3">
          <Film className="w-3.5 h-3.5 text-amber-800" />
          <span>Movie-Clip Shadowing App · {MOVIE_INFO.courseName.split(',')[0]}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight text-[#451A03] font-['Outfit']">
          Scene Shadow
        </h1>
        <div className="text-lg font-bold text-[#92400E] mt-0.5">
          {MOVIE_INFO.titleEn} <span className="text-sm font-medium text-stone-500">({MOVIE_INFO.titleKo})</span>
        </div>

        {/* One-line explanation */}
        <p className="mt-2 text-base font-semibold text-[#78350F]">
          "Listen. Copy. Speak at the same time."
        </p>
        <p className="text-xs text-stone-500 mt-0.5">
          귀로 듣고, 입으로 똑같이 따라 말하는 영화 쉐도잉 훈련
        </p>

        {/* Character Badges */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-amber-900">
          <span className="px-2.5 py-1 bg-white/90 rounded-lg shadow-2xs border border-amber-200/80">⚡ Dash</span>
          <span className="px-2.5 py-1 bg-white/90 rounded-lg shadow-2xs border border-amber-200/80">👩 Helen</span>
          <span className="px-2.5 py-1 bg-white/90 rounded-lg shadow-2xs border border-amber-200/80">💜 Violet</span>
          <span className="px-2.5 py-1 bg-white/90 rounded-lg shadow-2xs border border-amber-200/80">💪 Bob</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 py-6 space-y-6 flex-1">
        {/* Progress summary if already practiced */}
        {completedCount > 0 && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-amber-900">Your Progress / 나의 진도</span>
              <p className="text-stone-600 mt-0.5">{completedCount} of {totalSentences} sentences practiced</p>
            </div>
            <button
              type="button"
              onClick={onGoToSentenceList}
              className="px-3 py-1.5 bg-white text-amber-900 font-semibold rounded-lg border border-amber-300 hover:bg-amber-100 flex items-center gap-1"
            >
              <span>View List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Card: What is Shadowing? (PRD Section 5 Screen 1) */}
        <div className="bg-white rounded-2xl p-5 border border-[#EADBCE] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold">What is shadowing? / 쉐도잉이란?</h2>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            원어민의 음성을 그림자(Shadow)처럼 약 0.5초 뒤에서 바로 따라 말하는 말하기 훈련법입니다. 자연스러운 리듬, 강조 단어, 억양을 몸에 익힐 수 있습니다.
          </p>

          <ul className="space-y-2 pt-1 text-xs text-stone-700">
            <li className="flex items-start gap-2 bg-[#FFFDF9] p-2.5 rounded-xl border border-amber-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <div>
                <span className="font-semibold text-stone-900">Listen to the natural clip:</span>
                <p className="text-stone-500 text-[11px]">원어민 배우의 소리와 억양을 먼저 귀로 집중해서 듣습니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-[#FFFDF9] p-2.5 rounded-xl border border-amber-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <div>
                <span className="font-semibold text-stone-900">Repeat at the exact same time:</span>
                <p className="text-stone-500 text-[11px]">배우의 목소리와 겹치듯이 동시에 소리 내어 말합니다.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 bg-[#FFFDF9] p-2.5 rounded-xl border border-amber-100">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
              <div>
                <span className="font-semibold text-stone-900">Copy rhythm, stress & intonation:</span>
                <p className="text-stone-500 text-[11px]">굵은 글씨의 강조 단어와 감정의 높낮이를 완벽히 복사합니다.</p>
              </div>
            </li>
          </ul>

          <div className="pt-1 text-[11px] text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
            💡 <strong>Why this scene:</strong> 대화가 빠르지 않고 일상적이며, 4명의 가족 캐릭터의 목소리가 뚜렷해 고등학생 및 초·중급자 쉐도잉에 최적입니다.
          </div>
        </div>

        {/* Primary Action Button (At least 48px tall, easy thumb tap) */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onStartPractice}
            className="w-full min-h-[56px] py-2 px-6 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] active:scale-[0.98] text-white font-bold rounded-2xl flex flex-col items-center justify-center shadow-md shadow-amber-900/15 transition-transform"
          >
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              <span className="text-lg tracking-wide font-['Outfit']">Start Practice</span>
            </div>
            <span className="text-xs font-normal text-amber-100">연습 시작 ({totalSentences}문장 순차 훈련)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onGoToSentenceList}
              className="min-h-[48px] py-2 px-3 bg-white hover:bg-amber-50 text-stone-800 border border-[#EADBCE] rounded-xl flex flex-col items-center justify-center text-xs font-semibold shadow-2xs transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Sentence List</span>
              </div>
              <span className="text-[10px] text-stone-500 font-normal">문장 목록 전체 보기</span>
            </button>

            <button
              type="button"
              onClick={onGoToEditSentences}
              className="min-h-[48px] py-2 px-3 bg-white hover:bg-amber-50 text-stone-800 border border-[#EADBCE] rounded-xl flex flex-col items-center justify-center text-xs font-semibold shadow-2xs transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-stone-600" />
                <span>Edit Sentences</span>
              </div>
              <span className="text-[10px] text-stone-500 font-normal">문장 편집 / JSON 관리</span>
            </button>
          </div>
        </div>

        {/* PRD Section 0-3 #1: Educational Use & Source card */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 text-xs text-stone-700 space-y-3 mt-4">
          <div className="border-b border-stone-200 pb-2">
            <h3 className="font-bold text-stone-900 text-sm">
              Educational Use & Source / 교육용 고지 및 출처
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {MOVIE_INFO.courseName} · {MOVIE_INFO.author} ({MOVIE_INFO.studentId})
            </p>
          </div>

          {/* Full notice (0-2) */}
          <div className="space-y-2 text-[11px] leading-relaxed text-stone-600 bg-white p-3 rounded-xl border border-stone-200/60">
            <p className="font-semibold text-stone-800">
              📌 {MOVIE_INFO.noticeTitleEn} / {MOVIE_INFO.noticeTitleKo}
            </p>
            <p>{MOVIE_INFO.noticeTextEn}</p>
            <p className="text-stone-500">{MOVIE_INFO.noticeTextKo}</p>
          </div>

          {/* Source lines from 0-1 */}
          <div className="text-[11px] space-y-1 text-stone-600">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-stone-500 font-medium">Movie Title:</span>
              <span className="col-span-2 font-semibold text-stone-800">{MOVIE_INFO.titleEn} ({MOVIE_INFO.titleKo}), {MOVIE_INFO.releaseYear}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-stone-500 font-medium">Director / Script:</span>
              <span className="col-span-2">{MOVIE_INFO.director}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-stone-500 font-medium">Production:</span>
              <span className="col-span-2">{MOVIE_INFO.productionCompany} / {MOVIE_INFO.distributionCompany}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-stone-500 font-medium">Scene:</span>
              <span className="col-span-2">{MOVIE_INFO.sceneDescription}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-stone-500 font-medium">Practice Range:</span>
              <span className="col-span-2 font-mono font-medium">{MOVIE_INFO.practiceRangeFormatted} ({MOVIE_INFO.startSeconds}s – {MOVIE_INFO.endSeconds}s)</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-stone-200">
              <span className="text-stone-500 font-medium">YouTube Source:</span>
              <span className="col-span-2">
                <a
                  href={MOVIE_INFO.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 underline font-medium"
                >
                  <span>{MOVIE_INFO.youtubeTitle} ({MOVIE_INFO.youtubeChannel})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

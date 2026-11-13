import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sentence, SentenceProgress, ShadowingStepId, SelfCheckScore } from '../types';
import { MOVIE_INFO, SHADOWING_STEPS } from '../data/movieInfo';
import { YouTubePlayer, YouTubePlayerHandle } from './YouTubePlayer';
import { SentenceHighlighter } from './SentenceHighlighter';
import { AudioRecorder } from './AudioRecorder';
import { SelfCheck } from './SelfCheck';
import { SpeechRecognitionCheck } from './SpeechRecognitionCheck';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Repeat,
  Eye,
  EyeOff,
  List,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface PracticeScreenProps {
  sentences: Sentence[];
  currentIndex: number;
  progress: Record<number, SentenceProgress>;
  onNavigateSentence: (newIndex: number) => void;
  onUpdateProgress: (sentenceId: number, updater: (prev: SentenceProgress) => SentenceProgress) => void;
  onGoToList: () => void;
  onGoToFinish: () => void;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  sentences,
  currentIndex,
  progress,
  onNavigateSentence,
  onUpdateProgress,
  onGoToList,
  onGoToFinish,
  playerRef,
}) => {
  const currentSentence = sentences[currentIndex] || sentences[0];

  // Practice state
  const [currentStep, setCurrentStep] = useState<ShadowingStepId>(1);
  const [textHidden, setTextHidden] = useState<boolean>(true);
  const [koreanHidden, setKoreanHidden] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlayingSegment, setIsPlayingSegment] = useState<boolean>(false);
  const [isRecordingWithPlayer, setIsRecordingWithPlayer] = useState<boolean>(false);

  // In-memory audio recording for this sentence
  const [recordingsCache, setRecordingsCache] = useState<Record<number, string | null>>({});

  const recordingStopTimerRef = useRef<number | null>(null);

  // When step changes, apply default text visibility rule from PRD
  const handleSelectStep = (stepId: ShadowingStepId) => {
    setCurrentStep(stepId);
    const stepConfig = SHADOWING_STEPS.find((s) => s.step === stepId);
    if (stepConfig) {
      setTextHidden(stepConfig.defaultTextHidden);
    }
  };

  // When current sentence changes
  useEffect(() => {
    // Reset play/record state
    setIsPlayingSegment(false);
    setIsRecordingWithPlayer(false);
    if (recordingStopTimerRef.current) {
      clearTimeout(recordingStopTimerRef.current);
    }
  }, [currentSentence?.id]);

  const currentSentenceProgress: SentenceProgress = progress[currentSentence?.id] || {
    id: currentSentence?.id,
    plays: 0,
    recordings: 0,
    selfCheck: [null, null, null],
    status: 'new',
  };

  // Play segment once or loop
  const handleTogglePlay = () => {
    if (!playerRef.current) return;

    if (isPlayingSegment) {
      playerRef.current.stopSegment();
      setIsPlayingSegment(false);
    } else {
      setIsPlayingSegment(true);
      // Increment play count
      onUpdateProgress(currentSentence.id, (prev) => ({
        ...prev,
        plays: (prev?.plays || 0) + 1,
      }));

      playerRef.current.playSegment(
        currentSentence.start,
        currentSentence.end,
        () => {
          if (!isLooping) {
            setIsPlayingSegment(false);
          }
        }
      );
    }
  };

  // Change playback speed
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setSpeed(speed);
    }
  };

  // Start simultaneous Playback + Voice Recording
  const handleStartPlaybackAndRecord = () => {
    if (!playerRef.current) return;

    setIsRecordingWithPlayer(true);
    setIsPlayingSegment(true);

    // Play sentence once (loop is ignored while recording per PRD Section 6)
    playerRef.current.playSegment(
      currentSentence.start,
      currentSentence.end,
      () => {
        // Segment reached its end! Wait 1 second (1000ms) then auto-stop recording
        if (recordingStopTimerRef.current) clearTimeout(recordingStopTimerRef.current);
        recordingStopTimerRef.current = window.setTimeout(() => {
          setIsRecordingWithPlayer(false);
          setIsPlayingSegment(false);
        }, 1000);
      }
    );
  };

  // Replay original clip right after (PRD Section 5 Screen 3 #7)
  const handleReplayOriginal = () => {
    if (!playerRef.current) return;
    setIsPlayingSegment(true);
    playerRef.current.playSegment(
      currentSentence.start,
      currentSentence.end,
      () => {
        setIsPlayingSegment(false);
      }
    );
  };

  // When voice recording completes
  const handleRecordComplete = () => {
    setIsRecordingWithPlayer(false);
    setIsPlayingSegment(false);

    // Update progress: status becomes "practiced" after one recording and "done" after a recording in Step 4
    onUpdateProgress(currentSentence.id, (prev) => {
      const newRecordings = (prev?.recordings || 0) + 1;
      let newStatus = prev?.status || 'new';

      if (currentStep === 4) {
        newStatus = 'done';
      } else if (newStatus === 'new') {
        newStatus = 'practiced';
      }

      return {
        ...prev,
        recordings: newRecordings,
        status: newStatus,
      };
    });
  };

  // Self check rating
  const handleRateSelfCheck = (index: 0 | 1 | 2, score: SelfCheckScore) => {
    onUpdateProgress(currentSentence.id, (prev) => {
      const newSelfCheck = [...prev.selfCheck] as [SelfCheckScore, SelfCheckScore, SelfCheckScore];
      newSelfCheck[index] = score;

      // If user provided ratings and has recorded, promote to practiced or done
      let status = prev.status;
      if (currentStep === 4 && prev.recordings > 0) {
        status = 'done';
      } else if (status === 'new') {
        status = 'practiced';
      }

      return {
        ...prev,
        selfCheck: newSelfCheck,
        status,
      };
    });
  };

  // Navigation handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigateSentence(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      onNavigateSentence(currentIndex + 1);
    } else {
      // Reached the end! Go to finish screen
      onGoToFinish();
    }
  };

  const currentStepConfig = SHADOWING_STEPS.find((s) => s.step === currentStep);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#2B1810]">
      {/* 1. Video Player (16:9) with one-line credit underneath */}
      <div className="sticky top-0 z-30 shadow-sm bg-black">
        <YouTubePlayer
          ref={playerRef}
          loop={isLooping && !isRecordingWithPlayer}
          speed={playbackSpeed}
        />
      </div>

      {/* Screen Navigation & Header Bar */}
      <div className="px-4 py-2.5 bg-[#FAF5EE] border-b border-[#EADBCE] flex items-center justify-between">
        <button
          type="button"
          onClick={onGoToList}
          className="min-h-[44px] px-2 py-1 text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 rounded-lg hover:bg-stone-200/50"
        >
          <List className="w-4 h-4 text-amber-700" />
          <span>List / 목록</span>
        </button>

        {/* 2. Sentence Counter with arrows (PRD Section 5 Screen 3 #2) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              currentIndex === 0
                ? 'text-stone-300 cursor-not-allowed'
                : 'text-stone-700 hover:bg-stone-200 active:scale-95'
            }`}
            title="Previous sentence"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold font-mono tracking-tight text-amber-950 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
            Sentence {currentIndex + 1} / {sentences.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-700 hover:bg-stone-200 active:scale-95 rounded-lg transition-colors"
            title="Next sentence"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Hide text toggle */}
        <button
          type="button"
          onClick={() => setTextHidden(!textHidden)}
          className="min-h-[44px] px-2 py-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 flex items-center gap-1"
        >
          {textHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{textHidden ? 'Show' : 'Hide'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Sentence Display Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#EADBCE] shadow-xs space-y-3">
          {/* Speaker label & time badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300">
              🗣️ {currentSentence.speaker}
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {currentSentence.start}s – {currentSentence.end}s
            </span>
          </div>

          {/* 3. Sentence text in large font (at least 22px), stress words in bold */}
          <div className="min-h-[70px] flex items-center justify-center py-2 px-1">
            <SentenceHighlighter
              text={currentSentence.text}
              stressWords={currentSentence.stress}
              hidden={textHidden}
              className="text-[22px] md:text-[24px] font-medium leading-snug"
            />
          </div>

          {/* 4. Korean meaning (small, gray, can be hidden) */}
          <div className="border-t border-stone-100 pt-2 flex items-center justify-between">
            <p className="text-xs text-stone-500 italic flex-1">
              {koreanHidden ? '••••••••••••••••' : currentSentence.korean}
            </p>
            <button
              type="button"
              onClick={() => setKoreanHidden(!koreanHidden)}
              className="text-[10px] text-stone-400 hover:text-stone-600 underline ml-2"
            >
              {koreanHidden ? '뜻 보기' : '뜻 숨기기'}
            </button>
          </div>
        </div>

        {/* 5. Control row: Play, Loop on/off, speed 0.5x / 0.75x / 1.0x */}
        <div className="bg-[#FAF5EE] p-3 rounded-2xl border border-[#EADBCE] flex flex-wrap items-center justify-between gap-2">
          {/* Play / Pause Segment */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`min-h-[48px] px-4 py-1.5 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
              isPlayingSegment
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isPlayingSegment ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlayingSegment ? 'Pause' : 'Play Segment'}</span>
            </div>
            <span className="text-[10px] font-normal text-amber-100">
              {isPlayingSegment ? '일시정지' : '한 문장 듣기'}
            </span>
          </button>

          {/* Loop on/off (Repeats with 1.5s pause per PRD) */}
          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`min-h-[48px] px-3 py-1.5 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all border ${
              isLooping
                ? 'bg-amber-400 text-stone-950 border-amber-500 font-bold shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5" />
              <span>Loop: {isLooping ? 'ON' : 'OFF'}</span>
            </div>
            <span className="text-[10px] opacity-80 font-normal">
              {isLooping ? '1.5초 간격 반복' : '반복 끄기'}
            </span>
          </button>

          {/* Speed Buttons: 0.5x, 0.75x, 1.0x */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
            {([0.5, 0.75, 1.0] as const).map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSetSpeed(rate)}
                className={`min-h-[40px] px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  playbackSpeed === rate
                    ? 'bg-[#78350F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* 6. Step guide (4 tabs, in order) */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#EADBCE] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#78350F]">
              4-Step Shadowing Guide / 4단계 쉐도잉
            </span>
            <span className="text-[10px] text-stone-400">Step {currentStep} of 4</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {SHADOWING_STEPS.map((s) => {
              const isActive = currentStep === s.step;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => handleSelectStep(s.step as ShadowingStepId)}
                  className={`min-h-[48px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold border-2 border-amber-600 shadow-2xs'
                      : 'bg-stone-50 hover:bg-amber-50 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span className="text-[11px] font-bold">Step {s.step}</span>
                  <span className="text-[10px] truncate max-w-full leading-tight font-medium">
                    {s.nameEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Step Instruction Banner */}
          {currentStepConfig && (
            <div className="bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl text-xs space-y-0.5">
              <p className="font-semibold text-amber-950">
                👉 Step {currentStepConfig.step} ({currentStepConfig.nameEn} / {currentStepConfig.nameKo}):{' '}
                <span className="font-normal text-stone-800">{currentStepConfig.descriptionEn}</span>
              </p>
              <p className="text-[11px] text-amber-900 font-medium">{currentStepConfig.descriptionKo}</p>
            </div>
          )}
        </div>

        {/* 7. Record Area: plays sentence once + records user's voice */}
        <AudioRecorder
          sentenceId={currentSentence.id}
          onStartPlaybackAndRecord={handleStartPlaybackAndRecord}
          onReplayOriginal={handleReplayOriginal}
          onRecordComplete={handleRecordComplete}
          isPlayerRecording={isRecordingWithPlayer}
          recordingBlobUrl={recordingsCache[currentSentence.id] || null}
          setRecordingBlobUrl={(url) => {
            setRecordingsCache((prev) => ({ ...prev, [currentSentence.id]: url }));
          }}
        />

        {/* 8. Self-check (after recording): 3 questions with 😊 / 😐 / 🙁 */}
        <SelfCheck
          ratings={currentSentenceProgress.selfCheck}
          onRate={handleRateSelfCheck}
        />

        {/* 9. Word check (optional): Web Speech API */}
        <SpeechRecognitionCheck
          expectedText={currentSentence.text}
          onSuccess={() => {
            onUpdateProgress(currentSentence.id, (prev) => ({
              ...prev,
              status: prev.status === 'new' ? 'practiced' : prev.status,
            }));
          }}
        />

        {/* 10. Next button */}
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[52px] py-2 px-6 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] active:scale-[0.98] text-white font-bold rounded-2xl flex flex-col items-center justify-center shadow-md transition-transform"
          >
            <div className="flex items-center gap-1.5 font-['Outfit'] text-base tracking-wide">
              <span>{currentIndex < sentences.length - 1 ? 'Next Sentence' : 'Finish Practice'}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-normal text-amber-100">
              {currentIndex < sentences.length - 1
                ? `다음 문장으로 이동 (${currentIndex + 2}/${sentences.length})`
                : '연습 완료 및 결과 보기 🎉'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

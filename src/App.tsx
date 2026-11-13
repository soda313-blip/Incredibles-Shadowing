import React, { useState, useEffect, useRef } from 'react';
import { Sentence, SentenceProgress, ScreenType } from './types';
import {
  loadSentences,
  saveSentences,
  resetSentencesToDefault,
  loadProgress,
  saveProgress,
} from './utils/storage';
import { YouTubePlayerHandle } from './components/YouTubePlayer';
import { StartScreen } from './components/StartScreen';
import { SentenceListScreen } from './components/SentenceListScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { EditSentencesScreen } from './components/EditSentencesScreen';
import { FinishScreen } from './components/FinishScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('start');
  const [sentences, setSentences] = useState<Sentence[]>(() => loadSentences());
  const [progress, setProgress] = useState<Record<number, SentenceProgress>>(() => loadProgress());
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const playerRef = useRef<YouTubePlayerHandle | null>(null);

  // Sync sentences to storage
  const handleSaveSentences = (updatedSentences: Sentence[]) => {
    setSentences(updatedSentences);
    saveSentences(updatedSentences);
    if (currentIndex >= updatedSentences.length) {
      setCurrentIndex(Math.max(0, updatedSentences.length - 1));
    }
  };

  const handleResetToDefault = () => {
    const defaults = resetSentencesToDefault();
    setSentences(defaults);
    setCurrentIndex(0);
  };

  // Sync progress to storage
  const handleUpdateProgress = (
    sentenceId: number,
    updater: (prev: SentenceProgress) => SentenceProgress
  ) => {
    setProgress((prevStore) => {
      const prevItem: SentenceProgress = prevStore[sentenceId] || {
        id: sentenceId,
        plays: 0,
        recordings: 0,
        selfCheck: [null, null, null],
        status: 'new',
      };
      const updatedItem = updater(prevItem);
      const newStore = { ...prevStore, [sentenceId]: updatedItem };
      saveProgress(newStore);
      return newStore;
    });
  };

  // Navigation handlers
  const handleStartPractice = () => {
    setCurrentIndex(0);
    setCurrentScreen('practice');
  };

  const handleSelectSentence = (sentenceId: number) => {
    const idx = sentences.findIndex((s) => s.id === sentenceId);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setCurrentScreen('practice');
  };

  const completedCount = sentences.filter(
    (s) => progress[s.id]?.status === 'practiced' || progress[s.id]?.status === 'done'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5EBE1] flex items-center justify-center selection:bg-amber-200">
      {/* Mobile-first portrait container (max-w 480px per PRD Section 8) */}
      <main className="w-full max-w-[480px] min-h-screen bg-[#FFFDF9] shadow-xl sm:border-x border-[#EADBCE] flex flex-col relative">
        {currentScreen === 'start' && (
          <StartScreen
            onStartPractice={handleStartPractice}
            onGoToSentenceList={() => setCurrentScreen('list')}
            onGoToEditSentences={() => setCurrentScreen('edit')}
            totalSentences={sentences.length}
            completedCount={completedCount}
          />
        )}

        {currentScreen === 'list' && (
          <SentenceListScreen
            sentences={sentences}
            progress={progress}
            onSelectSentence={handleSelectSentence}
            onBackToStart={() => setCurrentScreen('start')}
            playerRef={playerRef}
          />
        )}

        {currentScreen === 'practice' && (
          <PracticeScreen
            sentences={sentences}
            currentIndex={currentIndex}
            progress={progress}
            onNavigateSentence={(newIdx) => setCurrentIndex(newIdx)}
            onUpdateProgress={handleUpdateProgress}
            onGoToList={() => setCurrentScreen('list')}
            onGoToFinish={() => setCurrentScreen('finish')}
            playerRef={playerRef}
          />
        )}

        {currentScreen === 'edit' && (
          <EditSentencesScreen
            sentences={sentences}
            onSaveSentences={handleSaveSentences}
            onResetToDefault={handleResetToDefault}
            onBack={() => setCurrentScreen('start')}
            playerRef={playerRef}
          />
        )}

        {currentScreen === 'finish' && (
          <FinishScreen
            sentences={sentences}
            progress={progress}
            onPracticeAgain={() => {
              setCurrentIndex(0);
              setCurrentScreen('practice');
            }}
            onGoToList={() => setCurrentScreen('list')}
            onSelectSentence={handleSelectSentence}
          />
        )}
      </main>
    </div>
  );
}

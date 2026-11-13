import { INITIAL_SENTENCES } from '../data/initialSentences';
import { Sentence, SentenceProgress } from '../types';

const SENTENCES_STORAGE_KEY = 'scene_shadow_sentences_v1';
const PROGRESS_STORAGE_KEY = 'scene_shadow_progress_v1';

// In-memory fallback
let memorySentences: Sentence[] = [...INITIAL_SENTENCES];
let memoryProgress: Record<number, SentenceProgress> = {};

export function loadSentences(): Sentence[] {
  try {
    const raw = localStorage.getItem(SENTENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memorySentences = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error, using memory fallback', e);
  }
  return memorySentences;
}

export function saveSentences(sentences: Sentence[]): boolean {
  memorySentences = sentences;
  try {
    localStorage.setItem(SENTENCES_STORAGE_KEY, JSON.stringify(sentences));
    return true;
  } catch (e) {
    console.warn('localStorage write error, fallback to memory', e);
    return false;
  }
}

export function resetSentencesToDefault(): Sentence[] {
  saveSentences(INITIAL_SENTENCES);
  return INITIAL_SENTENCES;
}

export function loadProgress(): Record<number, SentenceProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryProgress = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error for progress, using memory fallback', e);
  }
  return memoryProgress;
}

export function saveProgress(progress: Record<number, SentenceProgress>): boolean {
  memoryProgress = progress;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    console.warn('localStorage write error for progress, fallback to memory', e);
    return false;
  }
}

export function getOrCreateSentenceProgress(id: number, currentProgress?: Record<number, SentenceProgress>): SentenceProgress {
  const store = currentProgress || loadProgress();
  if (store[id]) {
    return store[id];
  }
  return {
    id,
    plays: 0,
    recordings: 0,
    selfCheck: [null, null, null],
    status: 'new',
  };
}

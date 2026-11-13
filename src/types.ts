export interface Sentence {
  id: number;
  speaker: string;
  text: string;
  korean: string;
  stress: string[];
  start: number;
  end: number;
}

export type ProgressStatus = 'new' | 'practiced' | 'done';
export type SelfCheckScore = 'smile' | 'neutral' | 'sad' | null;

export interface SentenceProgress {
  id: number;
  plays: number;
  recordings: number;
  selfCheck: [SelfCheckScore, SelfCheckScore, SelfCheckScore];
  status: ProgressStatus;
}

export type ScreenType = 'start' | 'list' | 'practice' | 'edit' | 'finish';

export type ShadowingStepId = 1 | 2 | 3 | 4;

export interface StepInfo {
  step: ShadowingStepId;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  defaultTextHidden: boolean;
}

import React, { useState } from 'react';
import { Sentence } from '../types';
import { MOVIE_INFO } from '../data/movieInfo';
import { YouTubePlayer, YouTubePlayerHandle } from './YouTubePlayer';
import {
  ChevronLeft,
  Plus,
  Play,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  Check,
  Copy,
} from 'lucide-react';

interface EditSentencesScreenProps {
  sentences: Sentence[];
  onSaveSentences: (sentences: Sentence[]) => void;
  onResetToDefault: () => void;
  onBack: () => void;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
}

export const EditSentencesScreen: React.FC<EditSentencesScreenProps> = ({
  sentences,
  onSaveSentences,
  onResetToDefault,
  onBack,
  playerRef,
}) => {
  // Add / Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [speaker, setSpeaker] = useState<string>('Dash');
  const [text, setText] = useState<string>('');
  const [korean, setKorean] = useState<string>('');
  const [stressInput, setStressInput] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('19.0');
  const [endTime, setEndTime] = useState<string>('23.0');
  const [formError, setFormError] = useState<string | null>(null);

  // Import / Export JSON modal state
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonCopied, setJsonCopied] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Grab player's current time rounded to 0.1s
  const handleSetStartNow = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setStartTime(time.toFixed(1));
    }
  };

  const handleSetEndNow = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setEndTime(time.toFixed(1));
    }
  };

  // Test play the segment
  const handleTestSegment = () => {
    const s = parseFloat(startTime);
    const e = parseFloat(endTime);
    if (!isNaN(s) && !isNaN(e) && e > s && playerRef.current) {
      playerRef.current.playSegment(s, e);
    }
  };

  // Check gentle warning
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const duration = (parseFloat(endTime) || 0) - (parseFloat(startTime) || 0);
  const isTooLong = wordCount > 12 || duration > 4.0;

  const handleSaveSentence = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const s = parseFloat(startTime);
    const eTime = parseFloat(endTime);

    if (!text.trim()) {
      setFormError('Please enter the English sentence. / 영어 문장을 입력하세요.');
      return;
    }
    if (isNaN(s) || isNaN(eTime)) {
      setFormError('Start and End times must be valid numbers. / 시작과 종료 시간은 숫자여야 합니다.');
      return;
    }
    if (s < MOVIE_INFO.startSeconds || eTime > MOVIE_INFO.endSeconds) {
      setFormError(
        `Start & End must be within the clip range (${MOVIE_INFO.startSeconds}s – ${MOVIE_INFO.endSeconds}s). / 시작·종료 시간은 ${MOVIE_INFO.startSeconds}초~${MOVIE_INFO.endSeconds}초 사이여야 합니다.`
      );
      return;
    }
    if (eTime <= s) {
      setFormError('End time must be greater than start time. / 종료 시간은 시작 시간보다 커야 합니다.');
      return;
    }

    const stressWords = stressInput
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    if (editingId !== null) {
      // Update existing
      const updated = sentences.map((item) =>
        item.id === editingId
          ? {
              ...item,
              speaker: speaker.trim() || 'Speaker',
              text: text.trim(),
              korean: korean.trim(),
              stress: stressWords.length > 0 ? stressWords : item.stress,
              start: s,
              end: eTime,
            }
          : item
      );
      onSaveSentences(updated);
      setEditingId(null);
    } else {
      // Add new
      const nextId = sentences.length > 0 ? Math.max(...sentences.map((i) => i.id)) + 1 : 1;
      const newSentence: Sentence = {
        id: nextId,
        speaker: speaker.trim() || 'Speaker',
        text: text.trim(),
        korean: korean.trim(),
        stress: stressWords,
        start: s,
        end: eTime,
      };
      onSaveSentences([...sentences, newSentence]);
    }

    // Reset form
    setText('');
    setKorean('');
    setStressInput('');
  };

  const handleStartEdit = (sentence: Sentence) => {
    setEditingId(sentence.id);
    setSpeaker(sentence.speaker);
    setText(sentence.text);
    setKorean(sentence.korean);
    setStressInput(sentence.stress.join(', '));
    setStartTime(sentence.start.toString());
    setEndTime(sentence.end.toString());
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    const updated = sentences.filter((s) => s.id !== id);
    onSaveSentences(updated);
    if (editingId === id) {
      setEditingId(null);
      setText('');
      setKorean('');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sentences.length) return;
    const reordered = [...sentences];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);
    onSaveSentences(reordered);
  };

  const handleOpenExport = () => {
    setJsonText(JSON.stringify(sentences, null, 2));
    setJsonError(null);
    setJsonCopied(false);
    setShowJsonModal(true);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch (e) {
      setJsonError('Failed to copy to clipboard.');
    }
  };

  const handleImportJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of sentences.');
      }
      for (const item of parsed) {
        if (!item.text || typeof item.start !== 'number' || typeof item.end !== 'number') {
          throw new Error('Each sentence must have text, start, and end properties.');
        }
      }
      onSaveSentences(parsed);
      setShowJsonModal(false);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9] text-[#2B1810]">
      {/* Top Video Player */}
      <div className="sticky top-0 z-30 shadow-sm bg-black">
        <YouTubePlayer ref={playerRef} />
      </div>

      {/* Header bar */}
      <div className="px-4 py-3 bg-[#FAF5EE] border-b border-[#EADBCE] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 rounded-lg hover:bg-stone-200/50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back / 돌아가기</span>
        </button>

        <h2 className="text-sm font-bold text-[#78350F]">
          Edit Sentences / 문장 편집
        </h2>

        <button
          type="button"
          onClick={handleOpenExport}
          className="min-h-[44px] px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Add/Edit Form Card */}
        <form
          onSubmit={handleSaveSentence}
          className="bg-white rounded-2xl p-4 border border-[#EADBCE] shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="font-bold text-sm text-[#78350F]">
              {editingId !== null ? 'Edit Sentence / 문장 수정' : 'Add New Sentence / 새 문장 추가'}
            </h3>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setText('');
                  setKorean('');
                }}
                className="text-xs text-stone-500 hover:text-stone-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Speaker & Timing */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Speaker / 화자
              </label>
              <select
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="Dash">Dash</option>
                <option value="Helen">Helen</option>
                <option value="Violet">Violet</option>
                <option value="Bob">Bob</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Start (s) / 시작
              </label>
              <input
                type="number"
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                End (s) / 종료
              </label>
              <input
                type="number"
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-300 font-mono"
              />
            </div>
          </div>

          {/* Sync Video Timing Buttons (PRD Section 5 Screen 4) */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleSetStartNow}
              className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Set Start = now</span>
            </button>
            <button
              type="button"
              onClick={handleSetEndNow}
              className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Set End = now</span>
            </button>
            <button
              type="button"
              onClick={handleTestSegment}
              className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test</span>
            </button>
          </div>

          {/* English Text */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              English Sentence / 영어 문장
            </label>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. WHAT?! Is this all vegetables?"
              className="w-full text-sm p-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Korean Meaning */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Korean Meaning / 한국어 뜻
            </label>
            <input
              type="text"
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              placeholder="e.g. 뭐라고요?! 이거 다 야채예요?"
              className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Stress Words */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Stress Words (comma-separated) / 강조 단어 (쉼표 구분)
            </label>
            <input
              type="text"
              value={stressInput}
              onChange={(e) => setStressInput(e.target.value)}
              placeholder="e.g. WHAT, all, vegetables, ORDERED"
              className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Gentle Warning (PRD Screen 4) */}
          {isTooLong && (
            <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
              <span>💡</span>
              <span>
                <strong>Tip:</strong> sentences shorter than 4s or 12 words are easier to shadow!
                (현재 {duration.toFixed(1)}초, {wordCount}단어)
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full min-h-[48px] py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{editingId !== null ? 'Update Sentence / 문장 수정' : 'Add Sentence / 문장 추가'}</span>
          </button>
        </form>

        {/* Current Sentences List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-[#78350F]">
              Sentence List ({sentences.length})
            </span>
            <button
              type="button"
              onClick={onResetToDefault}
              className="text-stone-500 hover:text-stone-800 text-[11px] underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to default 18 sentences / 기본값 복원</span>
            </button>
          </div>

          {sentences.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs bg-white rounded-2xl border border-stone-200">
              No sentences yet. Add one above!
            </div>
          ) : (
            sentences.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                      {item.speaker}
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {item.start}s – {item.end}s
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sentences.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-stone-800">{item.text}</p>
                <p className="text-[11px] text-stone-500">{item.korean}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* JSON Import/Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-stone-900">
                JSON Export & Import / JSON 백업 및 가져오기
              </h3>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {jsonError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg font-medium">
                {jsonError}
              </p>
            )}

            <textarea
              rows={9}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-300 bg-stone-50"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex-1 min-h-[44px] py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-300"
              >
                {jsonCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{jsonCopied ? 'Copied! / 복사됨' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleImportJson}
                className="flex-1 min-h-[44px] py-1.5 px-3 bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Import JSON / 적용</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

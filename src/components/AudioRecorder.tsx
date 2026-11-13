import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, AlertCircle, RotateCcw, Volume2 } from 'lucide-react';

interface AudioRecorderProps {
  sentenceId: number;
  onStartPlaybackAndRecord: () => void;
  onReplayOriginal: () => void;
  onRecordComplete: () => void;
  isPlayerRecording: boolean;
  recordingBlobUrl: string | null;
  setRecordingBlobUrl: (url: string | null) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  sentenceId,
  onStartPlaybackAndRecord,
  onReplayOriginal,
  onRecordComplete,
  isPlayerRecording,
  recordingBlobUrl,
  setRecordingBlobUrl,
}) => {
  const [micDenied, setMicDenied] = useState(false);
  const [isPlayingMyVoice, setIsPlayingMyVoice] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop my voice audio when sentence changes or unmounts
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlayingMyVoice(false);
  }, [sentenceId]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const handleStartRecord = async () => {
    try {
      setMicDenied(false);

      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      // Check MediaRecorder support with fallback MIME types for Safari & Chrome
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        mimeType = 'audio/aac';
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(audioBlob);
        setRecordingBlobUrl(url);
        setRecordingStatus('idle');
        onRecordComplete();
      };

      recorder.start();
      setRecordingStatus('recording');

      // Trigger simultaneous sentence video playback in parent
      onStartPlaybackAndRecord();
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      setMicDenied(true);
      setRecordingStatus('idle');
    }
  };

  const handleManualStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('processing');
    }
  };

  const handlePlayMyVoice = () => {
    if (!recordingBlobUrl) return;

    if (isPlayingMyVoice && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingMyVoice(false);
      return;
    }

    const audio = new Audio(recordingBlobUrl);
    audioElementRef.current = audio;

    audio.onended = () => {
      setIsPlayingMyVoice(false);
    };
    audio.onerror = () => {
      setIsPlayingMyVoice(false);
    };

    audio.play()
      .then(() => setIsPlayingMyVoice(true))
      .catch((err) => {
        console.warn('Error playing voice:', err);
        setIsPlayingMyVoice(false);
      });
  };

  return (
    <div className="w-full bg-[#FAF5EE] border border-[#EADBCE] rounded-2xl p-4 space-y-3 shadow-xs">
      {micDenied && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-stone-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">
              Mic is off. You can still listen and shadow out loud.
            </p>
            <p className="text-stone-600 mt-0.5 text-[11px]">
              마이크가 꺼져 있어도 영상을 들으며 큰 소리로 쉐도잉을 계속할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Main Record Action Button */}
      <div className="flex flex-col items-center justify-center">
        {recordingStatus === 'recording' || isPlayerRecording ? (
          <button
            type="button"
            onClick={handleManualStop}
            className="w-full min-h-[52px] bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-xl flex flex-col items-center justify-center shadow-md animate-pulse transition-transform"
          >
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 fill-current" />
              <span className="text-base">Recording... Tap to Stop</span>
            </div>
            <span className="text-[11px] font-normal opacity-90">녹음 중... (문장 종료 1초 후 자동 종료)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartRecord}
            className="w-full min-h-[52px] bg-[#D97706] hover:bg-[#B45309] active:scale-[0.98] text-white font-bold rounded-xl flex flex-col items-center justify-center shadow-md transition-all"
          >
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              <span className="text-base tracking-wide">Record & Shadow</span>
            </div>
            <span className="text-[11px] font-normal text-amber-100">
              {recordingBlobUrl ? 'Re-record / 다시 녹음하기' : 'Record voice with video / 영상과 함께 녹음'}
            </span>
          </button>
        )}
      </div>

      {/* Playback Comparison Controls (PRD #7: My Voice to play recording, Original to replay clip right after) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          disabled={!recordingBlobUrl || recordingStatus === 'recording'}
          onClick={handlePlayMyVoice}
          className={`min-h-[48px] py-1.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all ${
            recordingBlobUrl && recordingStatus !== 'recording'
              ? 'bg-amber-100/80 hover:bg-amber-200 text-[#78350F] border border-amber-300 shadow-xs'
              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            {isPlayingMyVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingMyVoice ? 'Pause Voice' : 'My Voice'}</span>
          </div>
          <span className="text-[10px] opacity-80">내 목소리 듣기</span>
        </button>

        <button
          type="button"
          disabled={recordingStatus === 'recording'}
          onClick={onReplayOriginal}
          className="min-h-[48px] py-1.5 px-3 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-800 border border-stone-300 rounded-xl flex flex-col items-center justify-center transition-all shadow-xs"
        >
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Original</span>
          </div>
          <span className="text-[10px] text-stone-500">배우 원래 소리</span>
        </button>
      </div>
    </div>
  );
};

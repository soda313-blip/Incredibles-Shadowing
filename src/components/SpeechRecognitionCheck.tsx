import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface SpeechRecognitionCheckProps {
  expectedText: string;
  onSuccess?: () => void;
}

export const SpeechRecognitionCheck: React.FC<SpeechRecognitionCheckProps> = ({
  expectedText,
  onSuccess,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string | null>(null);
  const [matchedResults, setMatchedResults] = useState<{
    words: { word: string; isMatched: boolean }[];
    matchedCount: number;
    totalCount: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Reset when expected sentence changes
  useEffect(() => {
    setSpokenTranscript(null);
    setMatchedResults(null);
    setStatusMessage('');
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }
  }, [expectedText]);

  if (!isSupported) {
    // If not supported by browser, hide the button per PRD requirement #9
    return null;
  }

  const cleanWord = (w: string) =>
    w.toLowerCase().replace(/[^a-z0-9']/gi, '').trim();

  const handleStartRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setStatusMessage('Listening to your speech... Speak now! / 듣고 있습니다...');
      setIsListening(true);
      setSpokenTranscript(null);
      setMatchedResults(null);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);

        // Word-level comparison (lowercasing and removing punctuation per PRD)
        const expectedWords = expectedText.split(/\s+/).filter(Boolean);
        const spokenWords = transcript.split(/\s+/).map(cleanWord).filter(Boolean);

        const spokenBag = [...spokenWords];

        const wordMatches = expectedWords.map((originalWord) => {
          const cleaned = cleanWord(originalWord);
          const foundIdx = spokenBag.indexOf(cleaned);
          if (foundIdx !== -1) {
            spokenBag.splice(foundIdx, 1);
            return { word: originalWord, isMatched: true };
          }
          return { word: originalWord, isMatched: false };
        });

        const matchedCount = wordMatches.filter((w) => w.isMatched).length;
        const totalCount = wordMatches.length;

        setMatchedResults({
          words: wordMatches,
          matchedCount,
          totalCount,
        });

        setStatusMessage(`You said ${matchedCount} of ${totalCount} words.`);
        if (onSuccess) onSuccess();
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusMessage('Microphone access was denied. / 마이크 권한이 거부되었습니다.');
        } else if (event.error === 'no-speech') {
          setStatusMessage('No speech was detected. Try again! / 음성이 감지되지 않았습니다.');
        } else {
          setStatusMessage('Could not recognize speech. Try again! / 다시 시도해 보세요.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start failed', err);
      setIsListening(false);
      setStatusMessage('Speech recognition error. Please try again.');
    }
  };

  return (
    <div className="w-full bg-[#FFFDF5] border border-amber-200/80 rounded-2xl p-3.5 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Speech Word Check / 음성 인식 단어 확인</span>
        </div>

        <button
          type="button"
          onClick={handleStartRecognition}
          className={`flex flex-col items-center justify-center px-4 py-2 min-h-[48px] rounded-xl font-medium text-xs transition-all shadow-xs ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
              : 'bg-amber-100 hover:bg-amber-200 text-[#78350F] border border-amber-300'
          }`}
        >
          <span className="font-semibold">{isListening ? 'Listening...' : 'Check My Words'}</span>
          <span className="text-[10px] opacity-80">{isListening ? '말씀하세요...' : '내 발음 확인'}</span>
        </button>
      </div>

      {statusMessage && (
        <p className="text-xs text-stone-600 font-medium text-center">
          {statusMessage}
        </p>
      )}

      {matchedResults && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-1.5 justify-center py-2 px-3 bg-white rounded-xl border border-stone-200/80">
            {matchedResults.words.map((item, idx) => (
              <span
                key={idx}
                className={`text-sm px-1.5 py-0.5 rounded transition-colors ${
                  item.isMatched
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-300 font-semibold'
                    : 'text-stone-500 underline decoration-stone-400 decoration-1 bg-stone-50'
                }`}
              >
                {item.word}
              </span>
            ))}
          </div>

          <div className="text-center text-xs text-amber-900 font-medium">
            🎯 <span className="font-bold">{matchedResults.matchedCount}</span> of{' '}
            <span className="font-bold">{matchedResults.totalCount}</span> words matched!
            {spokenTranscript && (
              <p className="text-[11px] text-stone-500 italic mt-1 truncate">
                Heard: "{spokenTranscript}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

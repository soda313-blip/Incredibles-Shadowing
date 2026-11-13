import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ExternalLink, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';
import { MOVIE_INFO } from '../data/movieInfo';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerHandle {
  playSegment: (start: number, end: number, onSegmentEnd?: () => void) => void;
  stopSegment: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  setSpeed: (rate: number) => void;
  isReady: boolean;
  isPlaying: boolean;
}

interface YouTubePlayerProps {
  loop?: boolean;
  speed?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onSegmentFinished?: () => void;
  className?: string;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(({
  loop = false,
  speed = 1.0,
  onTimeUpdate,
  onSegmentFinished,
  className = '',
}, ref) => {
  const containerId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(MOVIE_INFO.startSeconds);

  // Segment tracking refs to avoid closure issues in intervals
  const activeSegmentRef = useRef<{ start: number; end: number; onEnd?: () => void } | null>(null);
  const loopRef = useRef(loop);
  loopRef.current = loop;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const loopTimeoutRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Synchronize playback rate when speed prop changes
  useEffect(() => {
    if (playerRef.current && isReady && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(speed);
      } catch (err) {
        console.warn('Error setting playback rate', err);
      }
    }
  }, [speed, isReady]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (isCancelled || !window.YT || !window.YT.Player) return;

      const element = document.getElementById(containerId.current);
      if (!element) return;

      try {
        playerRef.current = new window.YT.Player(containerId.current, {
          videoId: MOVIE_INFO.videoId,
          playerVars: {
            start: MOVIE_INFO.startSeconds,
            end: MOVIE_INFO.endSeconds,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            controls: 1,
            cc_load_policy: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              try {
                event.target.setPlaybackRate(speedRef.current);
              } catch (e) {
                // Ignore
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player error code:', event.data);
              // Error 101 or 150: The owner of the requested video does not allow it to be played in embedded players
              if (event.data === 101 || event.data === 150 || event.data === 2) {
                setEmbedBlocked(true);
              }
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize YouTube Player:', err);
        setEmbedBlocked(true);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      isCancelled = true;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Time polling and segment management (every 100ms as required by PRD Section 4)
  useEffect(() => {
    pollIntervalRef.current = window.setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      try {
        const time = playerRef.current.getCurrentTime();
        if (typeof time === 'number' && !isNaN(time)) {
          setCurrentTime(time);
          if (onTimeUpdate) {
            onTimeUpdate(time);
          }

          // Check segment boundary
          const activeSegment = activeSegmentRef.current;
          if (activeSegment) {
            if (time >= activeSegment.end) {
              // Pause video
              playerRef.current.pauseVideo();
              setIsPlaying(false);

              if (activeSegment.onEnd) {
                activeSegment.onEnd();
              }
              if (onSegmentFinished) {
                onSegmentFinished();
              }

              // Loop check: if Loop is on, wait 1.5 seconds, then play the same sentence again
              if (loopRef.current) {
                if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
                loopTimeoutRef.current = window.setTimeout(() => {
                  if (activeSegmentRef.current) {
                    playerRef.current.seekTo(activeSegmentRef.current.start, true);
                    playerRef.current.playVideo();
                    setIsPlaying(true);
                  }
                }, 1500);
              } else {
                activeSegmentRef.current = null;
              }
            }
          }
        }
      } catch (e) {
        // Ignore iframe poll exception
      }
    }, 100);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [onTimeUpdate, onSegmentFinished]);

  const playSegment = useCallback((start: number, end: number, onEnd?: () => void) => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }

    activeSegmentRef.current = { start, end, onEnd };

    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') {
      console.warn('Player not ready for segment playback');
      return;
    }

    try {
      if (typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(speedRef.current);
      }
      playerRef.current.seekTo(start, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Failed to play segment:', err);
    }
  }, []);

  const stopSegment = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    activeSegmentRef.current = null;
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try {
        return playerRef.current.getCurrentTime() || currentTime;
      } catch (e) {
        return currentTime;
      }
    }
    return currentTime;
  }, [currentTime]);

  const setSpeed = useCallback((rate: number) => {
    speedRef.current = rate;
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(rate);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    playSegment,
    stopSegment,
    getCurrentTime,
    seekTo,
    setSpeed,
    isReady,
    isPlaying,
  }), [playSegment, stopSegment, getCurrentTime, seekTo, setSpeed, isReady, isPlaying]);

  return (
    <div className={`w-full overflow-hidden bg-black/95 ${className}`}>
      {/* 16:9 Video Aspect Ratio Container */}
      <div className="relative w-full aspect-video bg-stone-900 flex items-center justify-center">
        {embedBlocked ? (
          <div className="p-4 text-center flex flex-col items-center justify-center max-w-sm text-stone-200">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm font-medium mb-1">
              This video can't play inside the app.
            </p>
            <p className="text-xs text-stone-400 mb-3">
              이 영상은 외부 임베드가 제한될 수 있습니다. 브라우저에서 직접 재생할 수 있습니다.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=TbQ_yX_rxNI&t=${MOVIE_INFO.startSeconds}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-lg text-xs transition-colors shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tap to open it on YouTube
            </a>
          </div>
        ) : (
          <>
            <div id={containerId.current} className="w-full h-full" />
            {!isReady && (
              <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center text-stone-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-xs font-medium">Loading Movie Clip (YouTube Player)...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mandatory PRD Section 0-3 #2 Credit line under video player: at least 13px */}
      <div className="px-3 py-1.5 bg-stone-900/90 border-t border-stone-800 text-stone-400 text-[13px] leading-tight text-center truncate">
        {MOVIE_INFO.oneLineCredit}
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

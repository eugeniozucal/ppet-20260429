import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  destroy: () => void;
};

const YOUTUBE_VIDEO_ID = 'Ekftp-0x2Ww';
const PLAYBACK_RATES = [0.5, 1, 1.5, 2, 3, 4];

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function VideoCanvas() {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player('pluspetrol-youtube-player', {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          playlist: YOUTUBE_VIDEO_ID,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
            setIsMuted(event.target.isMuted());
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT?.PlayerState?.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    playerRef.current?.seekTo(nextTime, true);
    setCurrentTime(nextTime);
  };

  const handleRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRate = Number(event.target.value);
    playerRef.current?.setPlaybackRate(nextRate);
    setPlaybackRate(nextRate);
  };

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <div id="pluspetrol-youtube-player" className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black via-black/85 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-20">
        <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-200"
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            aria-label={isMuted ? 'Activar audio' : 'Silenciar video'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || currentTime)}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer accent-white"
              aria-label="Progreso del video"
            />
            <div className="mt-1 flex justify-between text-[10px] font-semibold tabular-nums text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
            Velocidad
            <select
              value={playbackRate}
              onChange={handleRateChange}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white outline-none transition hover:bg-white/20"
              aria-label="Velocidad de reproducción"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate} className="bg-slate-950 text-white">
                  {rate}x
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { FilmStream, MediaItem } from '../types/film';

type Props = {
  mode: 'film' | 'clip';
  clip: MediaItem | null;
  filmStream: FilmStream | null;
  posterUrl?: string;
  title: string;
  loadingFilm?: boolean;
};

export function MediaPlayer({
  mode,
  clip,
  filmStream,
  posterUrl,
  title,
  loadingFilm = false,
}: Props) {
  const [playingYoutube, setPlayingYoutube] = useState(false);

  useEffect(() => {
    setPlayingYoutube(false);
  }, [mode, clip?.id, filmStream?.id]);

  if (mode === 'film') {
    if (loadingFilm) {
      return (
        <div className="player-shell aspect-video flex items-center justify-center">
          <p className="text-sm text-muted">Ищем полный фильм...</p>
        </div>
      );
    }

    if (filmStream?.streamUrl) {
      return (
        <div className="player-shell aspect-video">
          <video
            key={filmStream.id}
            src={filmStream.streamUrl}
            controls
            playsInline
            preload="metadata"
            poster={posterUrl}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        </div>
      );
    }

    return (
      <div className="player-shell aspect-video flex items-center justify-center px-6 text-center bg-elevated">
        <div className="space-y-2">
          <p className="text-sm text-muted">Полный фильм для этого названия пока не найден</p>
          <p className="text-xs text-muted">Переключитесь на вкладку «Трейлеры»</p>
        </div>
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="player-shell aspect-video flex items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">Нет доступных роликов для этого фильма</p>
      </div>
    );
  }

  if (clip.kind === 'native' && clip.streamUrl) {
    return (
      <div className="player-shell aspect-video">
        <video
          key={clip.id}
          src={clip.streamUrl}
          controls
          playsInline
          preload="metadata"
          poster={posterUrl}
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />
      </div>
    );
  }

  if (clip.embedUrl) {
    if (!playingYoutube) {
      return (
        <button
          type="button"
          className="player-shell aspect-video relative w-full overflow-hidden text-left"
          onClick={() => setPlayingYoutube(true)}
        >
          {posterUrl ? (
            <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 text-2xl">
              ▶
            </span>
            <span className="text-sm font-medium">{clip.title}</span>
          </div>
        </button>
      );
    }

    return (
      <div className="player-shell aspect-video">
        <iframe
          key={`${clip.id}-playing`}
          src={clip.embedUrl.replace('autoplay=0', 'autoplay=1').includes('autoplay=1')
            ? clip.embedUrl
            : `${clip.embedUrl}&autoplay=1`}
          title={`${title} — ${clip.title}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="player-shell aspect-video flex items-center justify-center px-6 text-center">
      <p className="text-sm text-muted">Формат видео не поддерживается</p>
    </div>
  );
}

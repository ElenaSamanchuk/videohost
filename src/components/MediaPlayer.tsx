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
          <p className="text-sm text-muted">Полный фильм в открытом доступе не найден</p>
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
    return (
      <div className="player-shell aspect-video">
        <iframe
          key={clip.id}
          src={clip.embedUrl}
          title={`${title} — ${clip.title}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
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

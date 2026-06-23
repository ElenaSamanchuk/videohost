import type { FilmVideo } from '../types/film';

type Props = {
  video: FilmVideo | null;
  title: string;
};

export function VideoPlayer({ video, title }: Props) {
  if (!video?.embedUrl) {
    return (
      <div className="player-shell aspect-video flex items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted">Видео недоступно для встраивания</p>
          <p className="text-xs text-muted">Выберите другой ролик или откройте Kinopoisk</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-shell aspect-video">
      <iframe
        key={video.id}
        src={video.embedUrl}
        title={`${title} — ${video.title}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

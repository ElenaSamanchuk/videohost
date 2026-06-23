import type { FilmVideo } from '../types/film';

type Props = {
  videos: FilmVideo[];
  activeId: string | null;
  onSelect: (video: FilmVideo) => void;
};

export function VideoPlaylist({ videos, activeId, onSelect }: Props) {
  if (!videos.length) {
    return (
      <div className="info-panel text-sm text-muted">
        Для этого фильма нет встроенных роликов. Используйте блок «Где смотреть полностью».
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            className={`video-tab ${activeId === video.id ? 'is-active' : ''}`}
            onClick={() => onSelect(video)}
          >
            {video.typeLabel}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {videos.map((video) => (
          <button
            key={`row-${video.id}`}
            type="button"
            onClick={() => onSelect(video)}
            className={`text-left rounded-2xl px-4 py-3 ring-1 transition-colors ${
              activeId === video.id
                ? 'bg-accent-soft ring-[color:var(--color-ring-hover)]'
                : 'bg-elevated ring-line hover:bg-surface'
            }`}
          >
            <p className="text-sm font-medium">{video.title}</p>
            <p className="text-xs text-muted mt-1">{video.typeLabel} · YouTube</p>
          </button>
        ))}
      </div>
    </div>
  );
}

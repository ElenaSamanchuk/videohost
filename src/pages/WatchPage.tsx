import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoPlaylist } from '../components/VideoPlaylist';
import { WhereToWatch } from '../components/WhereToWatch';
import {
  fetchFilmDetails,
  fetchFilmVideos,
  filmTitle,
  formatCountries,
  formatGenres,
  isInWatchlist,
  normalizeVideos,
  pickDefaultVideo,
  ratingTone,
  toggleWatchlist,
} from '../lib/api';
import type { FilmVideo } from '../types/film';

export function WatchPage() {
  const { filmId = '' } = useParams();
  const numericId = Number(filmId);
  const [activeVideo, setActiveVideo] = useState<FilmVideo | null>(null);
  const [saved, setSaved] = useState(false);

  const filmQuery = useQuery({
    queryKey: ['film', filmId],
    queryFn: () => fetchFilmDetails(filmId),
    enabled: Boolean(filmId),
  });

  const videosQuery = useQuery({
    queryKey: ['film-videos', filmId],
    queryFn: () => fetchFilmVideos(filmId),
    enabled: Boolean(filmId),
  });

  const videos = useMemo(
    () => normalizeVideos(videosQuery.data?.items),
    [videosQuery.data?.items],
  );

  useEffect(() => {
    if (!videos.length) {
      setActiveVideo(null);
      return;
    }
    setActiveVideo((current) => current ?? pickDefaultVideo(videos));
  }, [videos]);

  useEffect(() => {
    if (Number.isFinite(numericId)) {
      setSaved(isInWatchlist(numericId));
    }
  }, [numericId]);

  const film = filmQuery.data;
  const title = film ? filmTitle(film) : 'Фильм';
  const tone = ratingTone(film?.rating);

  if (filmQuery.isLoading) {
    return (
      <main className="pt-24 sm:pt-28 pb-16">
        <div className="page-wrap space-y-6">
          <div className="player-shell aspect-video animate-pulse bg-elevated" />
          <div className="h-24 rounded-2xl bg-elevated animate-pulse" />
        </div>
      </main>
    );
  }

  if (filmQuery.isError || !film) {
    return (
      <main className="pt-24 sm:pt-28 pb-16">
        <div className="page-wrap">
          <div className="info-panel space-y-4">
            <p className="text-sm text-rose-300">Фильм не найден или API недоступен.</p>
            <Link to="/" className="btn-secondary inline-flex">
              ← В каталог
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <div className="page-wrap space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="btn-ghost">
            ← Каталог
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!Number.isFinite(numericId)) return;
              toggleWatchlist(numericId);
              setSaved(isInWatchlist(numericId));
            }}
          >
            {saved ? '★ В списке' : '☆ В список'}
          </button>
        </div>

        <section className="grid xl:grid-cols-[1fr_320px] gap-6 xl:gap-8">
          <div className="space-y-5">
            <VideoPlayer video={activeVideo} title={title} />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-violet-300">Смотреть на сайте</p>
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
              {film.slogan ? <p className="text-sm text-zinc-300 italic">{film.slogan}</p> : null}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span>{film.year ?? '—'}</span>
                <span>·</span>
                <span>{formatGenres(film.genres)}</span>
                <span>·</span>
                <span>{formatCountries(film.countries)}</span>
                {film.filmLength ? (
                  <>
                    <span>·</span>
                    <span>{film.filmLength} мин</span>
                  </>
                ) : null}
                {film.rating != null ? (
                  <span className={`inline-flex rating-badge rating-badge--${tone === 'neutral' ? 'mid' : tone}`}>
                    {film.rating}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
              {film.description || 'Описание отсутствует.'}
            </p>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28 h-fit">
            <div className="info-panel space-y-3">
              <h2 className="text-sm font-semibold">Ролики</h2>
              <p className="text-xs text-muted">
                Трейлеры и клипы из Kinopoisk API — переключайте прямо в плеере.
              </p>
              {videosQuery.isLoading ? (
                <div className="h-32 rounded-2xl bg-surface animate-pulse" />
              ) : (
                <VideoPlaylist videos={videos} activeId={activeVideo?.id ?? null} onSelect={setActiveVideo} />
              )}
            </div>
          </aside>
        </section>

        <WhereToWatch webUrl={film.webUrl} filmTitle={title} />
      </div>
    </main>
  );
}

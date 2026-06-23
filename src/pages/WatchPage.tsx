import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MediaPlayer } from '../components/MediaPlayer';
import { VideoPlaylist } from '../components/VideoPlaylist';
import { findAlternativeClips, findFallbackNativeStream, findFullFilmStream } from '../lib/archive';
import {
  fetchFilmDetails,
  fetchFilmVideos,
  filmSearchTitles,
  filmTitle,
  formatCountries,
  formatGenres,
  isInWatchlist,
  normalizeMediaItems,
  pickDefaultClip,
  ratingTone,
  toggleWatchlist,
} from '../lib/api';
import type { MediaItem, WatchMode } from '../types/film';

export function WatchPage() {
  const { filmId = '' } = useParams();
  const numericId = Number(filmId);
  const [watchMode, setWatchMode] = useState<WatchMode>('film');
  const [activeClip, setActiveClip] = useState<MediaItem | null>(null);
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

  const kinopoiskClips = useMemo(
    () => normalizeMediaItems(videosQuery.data?.items),
    [videosQuery.data?.items],
  );

  const film = filmQuery.data;
  const title = film ? filmTitle(film) : 'Фильм';
  const searchTitles = film ? filmSearchTitles(film) : [];
  const needsAlternatives = !videosQuery.isLoading && kinopoiskClips.length === 0;

  const alternativesQuery = useQuery({
    queryKey: ['alt-clips', filmId, searchTitles.join('|'), film?.year],
    queryFn: () => findAlternativeClips(searchTitles, film!.year),
    enabled: Boolean(film) && needsAlternatives,
    staleTime: 1000 * 60 * 30,
  });

  const allClips = useMemo(() => {
    if (kinopoiskClips.length) return kinopoiskClips;
    return alternativesQuery.data ?? [];
  }, [kinopoiskClips, alternativesQuery.data]);

  const usingAlternatives = kinopoiskClips.length === 0 && allClips.length > 0;

  const filmStreamQuery = useQuery({
    queryKey: ['film-stream', filmId, film?.year, searchTitles.join('|'), allClips.length],
    queryFn: async () => {
      if (!Number.isFinite(numericId) || !film) return null;
      const archive = await findFullFilmStream(numericId, searchTitles, film.year);
      if (archive) return archive;
      return findFallbackNativeStream(allClips);
    },
    enabled: Boolean(film) && !videosQuery.isLoading && !alternativesQuery.isFetching,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!allClips.length) {
      setActiveClip(null);
      return;
    }
    setActiveClip((current) => current ?? pickDefaultClip(allClips));
  }, [allClips]);

  useEffect(() => {
    if (Number.isFinite(numericId)) {
      setSaved(isInWatchlist(numericId));
    }
  }, [numericId]);

  useEffect(() => {
    if (watchMode === 'film' && !filmStreamQuery.isLoading && !filmStreamQuery.data && allClips.length) {
      setWatchMode('clips');
    }
  }, [watchMode, filmStreamQuery.isLoading, filmStreamQuery.data, allClips.length]);

  const tone = ratingTone(film?.rating);
  const filmStream = filmStreamQuery.data ?? null;
  const isOpenFilm = filmStream?.source === 'archive' || filmStream?.source === 'commons';
  const clipsLoading = videosQuery.isLoading || (needsAlternatives && alternativesQuery.isLoading);

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
          <div className="flex items-center gap-2">
            <Link to="/list" className="btn-ghost hidden sm:inline-flex">
              Мой список
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
        </div>

        <div className="flex gap-2 p-1 bg-elevated rounded-2xl ring-1 ring-line w-fit">
          <button
            type="button"
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              watchMode === 'film' ? 'bg-accent text-white' : 'text-muted hover:text-ink'
            }`}
            onClick={() => setWatchMode('film')}
          >
            Фильм
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              watchMode === 'clips' ? 'bg-accent text-white' : 'text-muted hover:text-ink'
            }`}
            onClick={() => setWatchMode('clips')}
          >
            Трейлеры
          </button>
        </div>

        <section className="grid xl:grid-cols-[1fr_320px] gap-6 xl:gap-8">
          <div className="space-y-5">
            <MediaPlayer
              mode={watchMode === 'film' ? 'film' : 'clip'}
              clip={activeClip}
              filmStream={filmStream}
              posterUrl={film.posterUrl || film.posterUrlPreview}
              title={title}
              loadingFilm={watchMode === 'film' && filmStreamQuery.isLoading}
            />

            {watchMode === 'film' && filmStream && !isOpenFilm ? (
              <p className="text-xs text-muted">
                Полный фильм в открытом доступе не найден — показан лучший доступный ролик.
              </p>
            ) : null}

            {watchMode === 'film' && isOpenFilm ? (
              <p className="text-xs text-muted">
                Полный фильм в открытом доступе ·{' '}
                {filmStream?.source === 'commons' ? 'Wikimedia Commons' : 'Internet Archive'} · без рекламы
              </p>
            ) : null}

            {usingAlternatives ? (
              <p className="text-xs text-muted">
                В Kinopoisk API нет роликов — подобраны видео из открытых источников (Archive, Wikimedia).
              </p>
            ) : null}

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

          {watchMode === 'clips' ? (
            <aside className="space-y-4 xl:sticky xl:top-28 h-fit">
              <div className="info-panel space-y-3">
                <h2 className="text-sm font-semibold">Ролики</h2>
                <p className="text-xs text-muted">
                  {usingAlternatives
                    ? 'Открытые источники без рекламы: Internet Archive и Wikimedia Commons.'
                    : 'Трейлеры, тизеры и MP4-ролики из Kinopoisk API.'}
                </p>
                {clipsLoading ? (
                  <div className="h-32 rounded-2xl bg-surface animate-pulse" />
                ) : (
                  <VideoPlaylist videos={allClips} activeId={activeClip?.id ?? null} onSelect={setActiveClip} />
                )}
                {!clipsLoading && !allClips.length ? (
                  <p className="text-xs text-muted">
                    Ничего не найдено ни в API, ни в открытых архивах. Попробуйте другой фильм из каталога
                    классики.
                  </p>
                ) : null}
              </div>
            </aside>
          ) : null}
        </section>
      </div>
    </main>
  );
}

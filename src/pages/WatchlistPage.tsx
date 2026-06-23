import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FilmCard } from '../components/FilmCard';
import { fetchFilmDetails, upsertWatchlistSnapshot } from '../lib/api';
import { useWatchlist } from '../hooks/useWatchlist';

import type { FilmPreview } from '../types/film';

function snapshotNeedsRefresh(snapshot: FilmPreview) {
  const hasTitle = Boolean(snapshot.nameRu || snapshot.nameEn || snapshot.nameOriginal);
  const hasPoster = Boolean(snapshot.posterUrlPreview || snapshot.posterUrl);
  return !hasTitle || !hasPoster;
}

export function WatchlistPage() {
  const { entries, remove, count } = useWatchlist();

  useEffect(() => {
    entries.forEach((entry) => {
      if (!snapshotNeedsRefresh(entry.snapshot)) return;

      fetchFilmDetails(entry.filmId)
        .then((film) => upsertWatchlistSnapshot(film))
        .catch(() => undefined);
    });
  }, [entries]);

  const handleRemove = (filmId: number) => {
    remove(filmId);
  };

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <div className="page-wrap space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <Link to="/" className="btn-ghost inline-flex mb-3">
              ← Каталог
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Мой список</h1>
            <p className="text-sm text-muted mt-1">
              Фильмы, которые вы сохранили. Карточки и постеры сохраняются в браузере.
            </p>
          </div>
          <p className="text-sm text-muted">{count} фильмов</p>
        </div>

        {!count ? (
          <div className="info-panel space-y-4">
            <p className="text-sm text-muted">Список пока пуст.</p>
            <p className="text-sm text-zinc-300">
              Откройте любой фильм и нажмите «☆ В список» — он появится здесь.
            </p>
            <Link to="/" className="btn-primary inline-flex">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {entries.map(({ filmId, snapshot }) => (
              <FilmCard key={filmId} film={snapshot} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

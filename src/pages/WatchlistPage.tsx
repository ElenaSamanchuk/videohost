import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FilmCard } from '../components/FilmCard';
import { fetchFilmDetails, filmTitle } from '../lib/api';
import { useWatchlist } from '../hooks/useWatchlist';

export function WatchlistPage() {
  const { ids, remove, count } = useWatchlist();

  const filmsQuery = useQuery({
    queryKey: ['watchlist', ids.join(',')],
    queryFn: async () => {
      const results = await Promise.allSettled(ids.map((id) => fetchFilmDetails(id)));
      return results
        .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchFilmDetails>>> => {
          return result.status === 'fulfilled';
        })
        .map((result) => result.value);
    },
    enabled: ids.length > 0,
  });

  const films = filmsQuery.data ?? [];

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
              Фильмы, которые вы сохранили. Список хранится в браузере на этом устройстве.
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
        ) : filmsQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {ids.map((id) => (
              <div key={id} className="rounded-2xl bg-elevated ring-1 ring-line aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {films.map((film) => (
              <div key={film.filmId} className="relative group">
                <FilmCard film={film} />
                <button
                  type="button"
                  className="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-zinc-100 ring-1 ring-white/15 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={(event) => {
                    event.preventDefault();
                    remove(film.filmId);
                  }}
                  aria-label={`Убрать «${filmTitle(film)}» из списка`}
                >
                  Убрать
                </button>
              </div>
            ))}
          </div>
        )}

        {count > 0 && !filmsQuery.isLoading && films.length < count ? (
          <p className="text-xs text-muted">
            Некоторые сохранённые фильмы не удалось загрузить — возможно, они больше недоступны в API.
          </p>
        ) : null}
      </div>
    </main>
  );
}

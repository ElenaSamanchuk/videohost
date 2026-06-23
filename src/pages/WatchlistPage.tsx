import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FilmCard } from '../components/FilmCard';
import { fetchFilmDetails } from '../lib/api';
import { useWatchlist } from '../hooks/useWatchlist';
import type { FilmDetails } from '../types/film';

export function WatchlistPage() {
  const { ids, remove, count } = useWatchlist();
  const queryClient = useQueryClient();

  const filmsQuery = useQuery({
    queryKey: ['watchlist', ids.join(',')],
    queryFn: async () => {
      const results = await Promise.allSettled(ids.map((id) => fetchFilmDetails(id)));
      return results
        .filter((result): result is PromiseFulfilledResult<FilmDetails> => {
          return result.status === 'fulfilled';
        })
        .map((result) => result.value);
    },
    enabled: ids.length > 0,
  });

  const filmsById = new Map((filmsQuery.data ?? []).map((film) => [film.filmId, film]));

  const handleRemove = (filmId: number) => {
    queryClient.setQueryData<FilmDetails[]>(['watchlist', ids.join(',')], (current) =>
      current?.filter((film) => film.filmId !== filmId),
    );
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
        ) : filmsQuery.isLoading && !filmsQuery.data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {ids.map((id) => (
              <div key={id} className="rounded-2xl bg-elevated ring-1 ring-line aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {ids.map((id) => {
              const film = filmsById.get(id);

              if (film) {
                return <FilmCard key={id} film={film} onRemove={handleRemove} />;
              }

              return (
                <div key={id} className="relative rounded-2xl bg-elevated ring-1 ring-line aspect-[2/3] flex flex-col">
                  <div className="flex-1 flex items-center justify-center px-4 text-center text-xs text-muted">
                    Не удалось загрузить карточку
                  </div>
                  <button
                    type="button"
                    className="m-3 rounded-full bg-black/80 px-3 py-2 text-xs font-medium text-zinc-100 ring-1 ring-white/20 hover:bg-rose-950/90"
                    onClick={() => handleRemove(id)}
                  >
                    Убрать из списка
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {count > 0 && filmsQuery.isSuccess && filmsById.size < count ? (
          <p className="text-xs text-muted">
            {count - filmsById.size} сохранённых фильмов не удалось загрузить из API — их всё равно можно убрать из
            списка.
          </p>
        ) : null}
      </div>
    </main>
  );
}

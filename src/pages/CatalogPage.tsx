import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilmCard } from '../components/FilmCard';
import { HeroSpotlight } from '../components/HeroSpotlight';
import { fetchFeaturedFilms, fetchTopFilms, searchFilms } from '../lib/api';

export function CatalogPage() {
  const [params] = useSearchParams();
  const keyword = params.get('q')?.trim() ?? '';
  const isSearch = keyword.length > 0;

  const featuredQuery = useQuery({
    queryKey: ['films', 'featured'],
    queryFn: fetchFeaturedFilms,
    enabled: !isSearch,
  });

  const query = useQuery({
    queryKey: ['films', isSearch ? 'search' : 'top250', keyword],
    queryFn: () => (isSearch ? searchFilms(keyword) : fetchTopFilms()),
    enabled: isSearch || featuredQuery.isSuccess || featuredQuery.isError,
  });

  const featured = featuredQuery.data ?? [];
  const catalogFilms = query.data?.films ?? [];
  const featuredIds = useMemo(() => new Set(featured.map((film) => film.filmId)), [featured]);
  const restFilms = useMemo(
    () => catalogFilms.filter((film) => !featuredIds.has(film.filmId)),
    [catalogFilms, featuredIds],
  );
  const spotlight = featured[0] ?? catalogFilms[0] ?? null;

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <div className="page-wrap space-y-10">
        {!isSearch && spotlight ? <HeroSpotlight film={spotlight} /> : null}

        {!isSearch ? (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Смотреть сейчас</h2>
                <p className="text-sm text-muted mt-1">
                  Проверенные фильмы с трейлерами и классикой в открытом доступе
                </p>
              </div>
              <p className="text-sm text-muted">
                {featuredQuery.isLoading ? 'Загрузка...' : `${featured.length} фильмов`}
              </p>
            </div>

            {featuredQuery.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-2xl bg-elevated ring-1 ring-line aspect-[2/3] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {featured.map((film) => (
                  <FilmCard key={film.filmId} film={film} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {isSearch ? 'Результаты поиска' : 'Каталог классики'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {isSearch
                  ? `Запрос «${keyword}» · ищем трейлеры в нескольких источниках`
                  : 'Топ-250 Kinopoisk · у большинства есть трейлеры'}
              </p>
            </div>
            <p className="text-sm text-muted">
              {query.isLoading ? 'Загрузка...' : `${isSearch ? catalogFilms.length : restFilms.length} фильмов`}
            </p>
          </div>

          {query.isError ? (
            <div className="info-panel text-sm text-rose-300">
              Не удалось загрузить каталог. Проверьте API-ключ Kinopoisk.
            </div>
          ) : null}

          {query.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="rounded-2xl bg-elevated ring-1 ring-line aspect-[2/3] animate-pulse" />
              ))}
            </div>
          ) : (isSearch ? catalogFilms : restFilms).length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {(isSearch ? catalogFilms : restFilms).map((film) => (
                <FilmCard key={film.filmId} film={film} />
              ))}
            </div>
          ) : (
            <div className="info-panel text-sm text-muted">Ничего не найдено.</div>
          )}
        </section>
      </div>
    </main>
  );
}

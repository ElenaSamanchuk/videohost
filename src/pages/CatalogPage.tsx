import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilmCard } from '../components/FilmCard';
import { HeroSpotlight } from '../components/HeroSpotlight';
import { fetchTopFilms, searchFilms } from '../lib/api';

export function CatalogPage() {
  const [params] = useSearchParams();
  const keyword = params.get('q')?.trim() ?? '';
  const isSearch = keyword.length > 0;

  const query = useQuery({
    queryKey: ['films', isSearch ? 'search' : 'top', keyword],
    queryFn: () => (isSearch ? searchFilms(keyword) : fetchTopFilms()),
  });

  const films = query.data?.films ?? [];
  const spotlight = useMemo(() => films[0] ?? null, [films]);

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <div className="page-wrap space-y-10">
        {!isSearch && spotlight ? <HeroSpotlight film={spotlight} /> : null}

        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {isSearch ? 'Результаты поиска' : 'Каталог'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {isSearch
                  ? `Запрос «${keyword}» · смотрите на сайте`
                  : 'Популярные фильмы · фильм и трейлеры без перехода на другие сервисы'}
              </p>
            </div>
            <p className="text-sm text-muted">
              {query.isLoading ? 'Загрузка...' : `${films.length} фильмов`}
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
          ) : films.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {films.map((film) => (
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

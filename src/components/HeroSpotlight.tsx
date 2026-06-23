import type { FilmPreview } from '../types/film';
import { filmTitle, formatGenres } from '../lib/api';
import { Link } from 'react-router-dom';

type Props = {
  film: FilmPreview;
};

export function HeroSpotlight({ film }: Props) {
  const poster = film.posterUrl || film.posterUrlPreview;
  const title = filmTitle(film);

  return (
    <section className="relative overflow-hidden rounded-3xl ring-1 ring-line min-h-[320px] sm:min-h-[380px]">
      {poster ? (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20" />
      <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-end min-h-[320px] sm:min-h-[380px] max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-300 mb-3">Сейчас в топе</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-3">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 mb-6">
          {film.year ?? '—'} · {formatGenres(film.genres)}
        </p>
        <div className="flex flex-wrap gap-3">
            <Link to={`/watch/${film.filmId}`} className="btn-primary">
              ▶ Смотреть
            </Link>
            <Link to={`/watch/${film.filmId}`} className="btn-secondary">
              Трейлеры
            </Link>
        </div>
      </div>
    </section>
  );
}

import type { FilmPreview } from '../types/film';
import { filmTitle, formatGenres, ratingTone } from '../lib/api';
import { Link } from 'react-router-dom';

type Props = {
  film: FilmPreview;
  onRemove?: (filmId: number) => void;
};

export function FilmCard({ film, onRemove }: Props) {
  const tone = ratingTone(film.rating);
  const title = filmTitle(film);

  return (
    <div className="relative">
      <Link to={`/watch/${film.filmId}`} className="film-card block">
        <div className="relative">
          <img
            src={film.posterUrlPreview || film.posterUrl || ''}
            alt=""
            className="film-card__poster"
            loading="lazy"
          />
          <div className="film-card__overlay" />
          <div className="film-card__play">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium ring-1 ring-white/20">
              ▶ Смотреть
            </span>
          </div>
          {film.rating != null && film.rating >= 0 && film.rating <= 10 ? (
            <span className={`rating-badge rating-badge--${tone === 'neutral' ? 'mid' : tone}`}>
              {film.rating}
            </span>
          ) : null}
        </div>
        <div className="p-4 space-y-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
          <p className="text-xs text-muted">
            {film.year ?? '—'} · {formatGenres(film.genres)}
          </p>
        </div>
      </Link>
      {onRemove ? (
        <button
          type="button"
          className="absolute top-3 right-3 z-20 rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-zinc-100 ring-1 ring-white/20 hover:bg-rose-950/90 hover:ring-rose-400/40 transition-colors"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove(film.filmId);
          }}
          aria-label={`Убрать «${title}» из списка`}
        >
          Убрать
        </button>
      ) : null}
    </div>
  );
}

import type { FilmDetails, MediaItem, RawVideoItem } from '../types/film';
import { filmSearchTitles, filmTitle, normalizeMediaItems } from './api';
import { findCommonsClips } from './commons';
import { getCuratedYoutubeTrailers } from './curated-trailers';
import { findTmdbTrailers } from './tmdb';

function dedupeMediaItems(items: MediaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.embedUrl ?? item.streamUrl ?? item.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function discoverClips(
  filmId: number,
  film: FilmDetails,
  rawVideos: RawVideoItem[] = [],
): Promise<MediaItem[]> {
  const titles = filmSearchTitles(film);
  const kinopoisk = normalizeMediaItems(rawVideos);
  const curated = getCuratedYoutubeTrailers(filmId, titles);
  const tmdb = await findTmdbTrailers(titles, film.year);

  const merged = dedupeMediaItems([...kinopoisk, ...curated, ...tmdb]);
  if (merged.length) return merged;

  const commons = await findCommonsClips(titles[0] ?? filmTitle(film), film.year);
  return dedupeMediaItems(commons);
}

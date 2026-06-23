import type { Country, FilmPreview, Genre, RawVideoItem } from '../types/film';

const API_BASE = 'https://kinopoiskapiunofficial.tech';

function apiKey() {
  return import.meta.env.VITE_KINOPOISK_API_KEY ?? '';
}

async function kinopoiskFetch<T>(path: string): Promise<T> {
  const key = apiKey();
  if (!key) {
    throw new Error('API key missing');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'X-API-KEY': key,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Kinopoisk API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchTopFilms(page = 1) {
  return kinopoiskFetch<{ films: FilmPreview[] }>(
    `/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=${page}`,
  );
}

export function searchFilms(keyword: string) {
  const query = encodeURIComponent(keyword.trim());
  return kinopoiskFetch<{ films: FilmPreview[]; keyword?: string }>(
    `/api/v2.1/films/search-by-keyword?keyword=${query}`,
  );
}

export function fetchFilmDetails(id: number | string) {
  return kinopoiskFetch<FilmPreview & { webUrl?: string; filmLength?: number; slogan?: string }>(
    `/api/v2.2/films/${id}`,
  );
}

export function fetchFilmVideos(id: number | string) {
  return kinopoiskFetch<{ items?: RawVideoItem[] }>(`/api/v2.2/films/${id}/videos`);
}

export function filmTitle(film: Pick<FilmPreview, 'nameRu' | 'nameEn' | 'nameOriginal'>) {
  return film.nameRu || film.nameEn || film.nameOriginal || 'Без названия';
}

export function formatGenres(genres: Genre[] = []) {
  return genres.map((item) => item.genre).filter(Boolean).join(' · ');
}

export function formatCountries(countries: Country[] = []) {
  return countries.map((item) => item.country).filter(Boolean).join(', ');
}

export function ratingTone(rating?: number) {
  if (rating == null || rating < 0) return 'neutral' as const;
  if (rating > 7) return 'high' as const;
  if (rating > 4) return 'mid' as const;
  return 'low' as const;
}

const VIDEO_TYPE_LABELS: Record<string, string> = {
  TRAILER: 'Трейлер',
  TEASER: 'Тизер',
  FEATURETTE: 'Фичеретт',
  CLIP: 'Клип',
  REVIEW: 'Обзор',
  SHORT: 'Короткометражка',
};

export function videoTypeLabel(type?: string) {
  if (!type) return 'Видео';
  return VIDEO_TYPE_LABELS[type] ?? type;
}

export function youtubeEmbedUrl(url: string, autoplay = false) {
  try {
    const parsed = new URL(url);
    let id: string | null = null;

    if (parsed.hostname.includes('youtube.com')) {
      id = parsed.searchParams.get('v');
    } else if (parsed.hostname === 'youtu.be') {
      id = parsed.pathname.replace('/', '');
    }

    if (!id) return null;
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      ...(autoplay ? { autoplay: '1' } : {}),
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

export function normalizeVideos(items: RawVideoItem[] = []) {
  return items
    .filter((item) => item.url)
    .map((item, index) => {
      const url = item.url!;
      const embedUrl = item.site === 'YOUTUBE' ? youtubeEmbedUrl(url) : null;
      const type = item.filmVideoType ?? 'VIDEO';
      return {
        id: `${type}-${index}-${url}`,
        title: item.name?.trim() || videoTypeLabel(type),
        url,
        embedUrl,
        type,
        typeLabel: videoTypeLabel(type),
        site: item.site ?? 'UNKNOWN',
      };
    })
    .filter((item) => item.embedUrl);
}

export function pickDefaultVideo(videos: ReturnType<typeof normalizeVideos>) {
  const priority = ['TRAILER', 'TEASER', 'FEATURETTE', 'CLIP', 'REVIEW'];
  for (const type of priority) {
    const match = videos.find((video) => video.type === type);
    if (match) return match;
  }
  return videos[0] ?? null;
}

export function watchlistKey() {
  return 'videohost-watchlist';
}

export function readWatchlist(): number[] {
  try {
    const raw = localStorage.getItem(watchlistKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function toggleWatchlist(filmId: number) {
  const current = readWatchlist();
  const next = current.includes(filmId)
    ? current.filter((id) => id !== filmId)
    : [...current, filmId];
  localStorage.setItem(watchlistKey(), JSON.stringify(next));
  return next;
}

export function isInWatchlist(filmId: number) {
  return readWatchlist().includes(filmId);
}

import type { Country, FilmDetails, FilmPreview, Genre, MediaItem, RawVideoItem } from '../types/film';

const API_BASE = 'https://kinopoiskapiunofficial.tech';

function apiKey() {
  return import.meta.env.VITE_KINOPOISK_API_KEY ?? '';
}

async function kinopoiskFetch<T>(path: string): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error('API key missing');

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
  return kinopoiskFetch<FilmDetails>(`/api/v2.2/films/${id}`);
}

export function fetchFilmVideos(id: number | string) {
  return kinopoiskFetch<{ items?: RawVideoItem[] }>(`/api/v2.2/films/${id}/videos`);
}

export function filmTitle(film: Pick<FilmPreview, 'nameRu' | 'nameEn' | 'nameOriginal'>) {
  return film.nameRu || film.nameEn || film.nameOriginal || 'Без названия';
}

export function filmSearchTitles(film: Pick<FilmPreview, 'nameRu' | 'nameEn' | 'nameOriginal'>) {
  return [film.nameEn, film.nameOriginal, film.nameRu].filter(Boolean) as string[];
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
  VIDEO: 'Видео',
};

export function videoTypeLabel(type?: string) {
  if (!type) return 'Видео';
  return VIDEO_TYPE_LABELS[type] ?? type;
}

function extractYoutubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('youtube.com') && parsed.hostname !== 'youtu.be') {
      return null;
    }

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.replace('/', '') || null;
    }

    const fromQuery = parsed.searchParams.get('v');
    if (fromQuery) return fromQuery;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const embedIndex = parts.indexOf('embed');
    if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];

    const vIndex = parts.indexOf('v');
    if (vIndex >= 0 && parts[vIndex + 1]) return parts[vIndex + 1];

    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(url: string, autoplay = false) {
  const id = extractYoutubeId(url);
  if (!id) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    ...(origin ? { origin } : {}),
    ...(autoplay ? { autoplay: '1' } : {}),
  });

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function normalizeStreamUrl(url: string) {
  const absolute = url.startsWith('//') ? `https:${url}` : url.startsWith('http') ? url : `https://${url}`;
  return absolute.replace(/^http:\/\//i, 'https://');
}

function nativeFormatScore(streamUrl: string | null) {
  if (!streamUrl) return 0;
  if (/\.mp4(\?|$)/i.test(streamUrl)) return 3;
  if (/\.webm(\?|$)/i.test(streamUrl)) return 2;
  if (/\.mov(\?|$)/i.test(streamUrl)) return 1;
  return 1;
}

function clipScore(item: MediaItem, typePriority: string[]) {
  const typeIndex = typePriority.indexOf(item.type);
  const typeScore = typeIndex >= 0 ? typePriority.length - typeIndex : 0;
  if (item.embedUrl) return typeScore * 10 + 5;
  return typeScore * 10 + nativeFormatScore(item.streamUrl);
}

function isNativeStreamUrl(url: string) {
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return true;
  return url.includes('trailers.s3.mds.yandex.net') || url.includes('pdl.warnerbros.com');
}

function isBlockedUrl(url: string) {
  return /\.flv(\?|$)/i.test(url) || url.includes('filmz.ru/videos/files/download');
}

export function normalizeMediaItems(items: RawVideoItem[] = []): MediaItem[] {
  return items
    .filter((item) => item.url && !isBlockedUrl(item.url))
    .map((item, index) => {
      const url = item.url!;
      const type = item.filmVideoType ?? 'VIDEO';
      const youtubeId = extractYoutubeId(url);
      const native = isNativeStreamUrl(url);

      let kind: MediaItem['kind'] = 'native';
      let embedUrl: string | null = null;
      let streamUrl: string | null = null;

      if (youtubeId || item.site?.toUpperCase() === 'YOUTUBE') {
        kind = 'youtube';
        embedUrl = youtubeEmbedUrl(url);
      } else if (native) {
        kind = 'native';
        streamUrl = normalizeStreamUrl(url);
      }

      return {
        id: `${type}-${index}-${url}`,
        title: item.name?.trim() || videoTypeLabel(type),
        url,
        kind,
        embedUrl,
        streamUrl,
        type,
        typeLabel: videoTypeLabel(type),
        site: item.site ?? (youtubeId ? 'YOUTUBE' : 'NATIVE'),
        source: 'kinopoisk' as const,
      };
    })
    .filter((item) => item.embedUrl || item.streamUrl);
}

export function pickDefaultClip(items: MediaItem[]) {
  if (!items.length) return null;

  const priority = ['TRAILER', 'TEASER', 'FEATURETTE', 'CLIP', 'VIDEO'];
  return [...items].sort((a, b) => clipScore(b, priority) - clipScore(a, priority))[0] ?? null;
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

export function removeFromWatchlist(filmId: number) {
  const next = readWatchlist().filter((id) => id !== filmId);
  localStorage.setItem(watchlistKey(), JSON.stringify(next));
  window.dispatchEvent(new Event('videohost-watchlist-change'));
  return next;
}

export function toggleWatchlist(filmId: number) {
  const current = readWatchlist();
  const next = current.includes(filmId)
    ? current.filter((id) => id !== filmId)
    : [...current, filmId];
  localStorage.setItem(watchlistKey(), JSON.stringify(next));
  window.dispatchEvent(new Event('videohost-watchlist-change'));
  return next;
}

export function isInWatchlist(filmId: number) {
  return readWatchlist().includes(filmId);
}

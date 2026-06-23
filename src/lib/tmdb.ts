import type { MediaItem } from '../types/film';
import { fetchWithTimeout } from './fetch';
import { youtubeToMediaItem } from './curated-trailers';

const TMDB_BASE = 'https://api.themoviedb.org/3';

type TmdbSearchResult = {
  results?: Array<{ id: number; title?: string; release_date?: string }>;
};

type TmdbVideo = {
  key?: string;
  name?: string;
  site?: string;
  type?: string;
  official?: boolean;
};

type TmdbVideosResult = {
  results?: TmdbVideo[];
};

function tmdbKey() {
  return import.meta.env.VITE_TMDB_API_KEY ?? '';
}

function scoreVideo(video: TmdbVideo) {
  let score = 0;
  if (video.site?.toUpperCase() === 'YOUTUBE') score += 10;
  if (video.type?.toUpperCase() === 'TRAILER') score += 8;
  if (video.type?.toUpperCase() === 'TEASER') score += 5;
  if (video.official) score += 3;
  return score;
}

export async function findTmdbTrailers(titles: string[], year?: number): Promise<MediaItem[]> {
  const key = tmdbKey();
  if (!key) return [];

  for (const title of titles) {
    const searchUrl = new URL(`${TMDB_BASE}/search/movie`);
    searchUrl.searchParams.set('api_key', key);
    searchUrl.searchParams.set('query', title);
    searchUrl.searchParams.set('include_adult', 'false');
    if (year) searchUrl.searchParams.set('year', String(year));

    const searchResponse = await fetchWithTimeout(searchUrl.toString(), { timeoutMs: 5000 });
    if (!searchResponse.ok) continue;

    const searchData = (await searchResponse.json()) as TmdbSearchResult;
    const match = searchData.results?.[0];
    if (!match?.id) continue;

    const videosUrl = new URL(`${TMDB_BASE}/movie/${match.id}/videos`);
    videosUrl.searchParams.set('api_key', key);

    const videosResponse = await fetchWithTimeout(videosUrl.toString(), { timeoutMs: 5000 });
    if (!videosResponse.ok) continue;

    const videosData = (await videosResponse.json()) as TmdbVideosResult;
    const videos = (videosData.results ?? [])
      .filter((video) => video.site?.toUpperCase() === 'YOUTUBE' && video.key)
      .sort((a, b) => scoreVideo(b) - scoreVideo(a))
      .slice(0, 4);

    if (!videos.length) continue;

    return videos.map((video) =>
      youtubeToMediaItem(
        video.key!,
        video.name?.trim() || 'Трейлер · TMDB',
        'tmdb',
        video.type?.toUpperCase() === 'TEASER' ? 'TEASER' : 'TRAILER',
      ),
    );
  }

  return [];
}

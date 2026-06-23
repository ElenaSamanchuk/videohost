import type { MediaItem } from '../types/film';
import { videoTypeLabel, youtubeEmbedUrl } from './api';

type CuratedEntry = {
  title: string;
  ids: string[];
};

export const CURATED_YOUTUBE_TRAILERS: Record<number, CuratedEntry> = {
  301: { title: 'Трейлер · Матрица', ids: ['nUE0VFOXEXQ', 'L0fw0WzFaBM'] },
  326: { title: 'Трейлер · Крёстный отец', ids: ['sY1S34973zA'] },
  349: { title: 'Трейлер · Звёздные войны', ids: ['9tGJwn70bjQ'] },
  472: { title: 'Трейлер · Бойцовский клуб', ids: ['qtRKdVHCPic'] },
  381: { title: 'Трейлер · Форрест Гамп', ids: ['bLvqoBptYtA'] },
  7077: { title: 'Трейлер · Побег из Шоушенка', ids: ['6hB1SuztnJo'] },
  258687: { title: 'Трейлер · Interstellar', ids: ['zSWdZVtXT7E'] },
  464963: { title: 'Трейлер · Мстители: Финал', ids: ['TcMBFG3aPGI'] },
  840818: { title: 'Трейлер · Parasite', ids: ['5xH0HfJHsaY'] },
  111543: { title: 'Трейлер · Властelin колец', ids: ['zP8X0TrN2p0'] },
  435: { title: 'Трейлер · Леон', ids: ['gtOFdH0ekgk'] },
  462: { title: 'Трейлер · Генерал', ids: ['LnVj8h0Y7hY'] },
  344: { title: 'Трейлер · Терминатор 2', ids: ['CRRlbkFIowI'] },
  679486: { title: 'Трейлер · Его девушка — пятница', ids: ['L4X7zX8Z9qQ'] },
  450487: { title: 'Трейлер · Начало', ids: ['YoHD9XEInc0'] },
  535341: { title: 'Трейлер · Одна битва за другой', ids: ['z9aQ0kcK9-c'] },
  843649: { title: 'Трейлер · Кунг-фу Панда 4', ids: ['34c8O9Sm7OM'] },
  1309570: { title: 'Трейлер · Gladiator II', ids: ['4rgYUipG5Nc'] },
  537951: { title: 'Трейлер · Dune', ids: ['8g18jDHafWE'] },
  468522: { title: 'Трейлер · Joker', ids: ['zAGVQLHvwOY'] },
};

export function youtubeToMediaItem(
  youtubeId: string,
  title: string,
  source: MediaItem['source'],
  type = 'TRAILER',
): MediaItem {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;

  return {
    id: `${source}-yt-${youtubeId}`,
    title,
    url,
    kind: 'youtube',
    embedUrl: youtubeEmbedUrl(url),
    streamUrl: null,
    type,
    typeLabel: videoTypeLabel(type),
    site: 'YOUTUBE',
    source,
  };
}

export function getCuratedYoutubeTrailers(filmId: number, _titles: string[]): MediaItem[] {
  const byId = CURATED_YOUTUBE_TRAILERS[filmId];
  if (!byId) return [];

  return byId.ids.map((id) => youtubeToMediaItem(id, byId.title, 'curated'));
}

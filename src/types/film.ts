export type Genre = { genre: string };
export type Country = { country: string };

export type FilmPreview = {
  filmId: number;
  nameRu?: string;
  nameEn?: string;
  nameOriginal?: string;
  year?: number;
  posterUrlPreview?: string;
  posterUrl?: string;
  rating?: number;
  genres?: Genre[];
  countries?: Country[];
  description?: string;
};

export type FilmDetails = FilmPreview & {
  webUrl?: string;
  filmLength?: number;
  slogan?: string;
};

export type RawVideoItem = {
  url?: string;
  name?: string;
  site?: string;
  filmVideoType?: string;
};

export type MediaKind = 'youtube' | 'native';

export type MediaItem = {
  id: string;
  title: string;
  url: string;
  kind: MediaKind;
  embedUrl: string | null;
  streamUrl: string | null;
  type: string;
  typeLabel: string;
  site: string;
  source?: 'kinopoisk' | 'archive' | 'commons' | 'tmdb' | 'curated';
};

export type FilmStream = {
  id: string;
  title: string;
  source: 'archive' | 'native' | 'commons';
  streamUrl: string;
  posterUrl?: string;
};

export type WatchMode = 'film' | 'clips';

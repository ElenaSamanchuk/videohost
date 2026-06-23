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
  ratingKinopoisk?: number;
  ratingImdb?: number;
};

export type RawVideoItem = {
  url?: string;
  name?: string;
  site?: string;
  filmVideoType?: string;
};

export type FilmVideo = {
  id: string;
  title: string;
  url: string;
  embedUrl: string | null;
  type: string;
  typeLabel: string;
  site: string;
};

export type TopFilmsResponse = { films: FilmPreview[] };
export type SearchFilmsResponse = { films: FilmPreview[]; keyword?: string };
export type VideosResponse = { items?: RawVideoItem[] };

export type CatalogMode = 'popular' | 'search';

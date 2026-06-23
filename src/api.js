const API_BASE = 'https://kinopoiskapiunofficial.tech';

function apiKey() {
  return import.meta.env.VITE_KINOPOISK_API_KEY ?? '';
}

async function kinopoiskFetch(path) {
  const key = apiKey();
  if (!key) {
    throw new Error('API key missing. Set VITE_KINOPOISK_API_KEY for build or local .env');
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

  return response.json();
}

export function fetchTopFilms(page = 1) {
  return kinopoiskFetch(`/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=${page}`);
}

export function searchFilms(keyword) {
  const query = encodeURIComponent(keyword.trim());
  return kinopoiskFetch(`/api/v2.1/films/search-by-keyword?keyword=${query}`);
}

export function fetchFilmDetails(id) {
  return kinopoiskFetch(`/api/v2.2/films/${id}`);
}

export function fetchFilmVideos(id) {
  return kinopoiskFetch(`/api/v2.2/films/${id}/videos`);
}

export function formatCountries(countries = []) {
  return countries.map((item) => item.country).filter(Boolean).join(', ');
}

export function formatGenres(genres = []) {
  return genres.map((item) => item.genre).filter(Boolean).join(', ');
}

export function ratingClass(rating) {
  if (rating > 7) return 'rating-badge rating-badge--high';
  if (rating > 4) return 'rating-badge rating-badge--mid';
  return 'rating-badge rating-badge--low';
}

export function youtubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function pickTrailer(videosPayload) {
  const items = videosPayload?.items ?? [];
  const youtube = items.find((item) => item.site === 'YOUTUBE' && item.url);
  return youtube ?? items.find((item) => item.url) ?? null;
}

import type { FilmStream, MediaItem } from '../types/film';
import { findCommonsClips } from './commons';
import { fetchWithTimeout } from './fetch';

type ArchiveDoc = {
  identifier: string;
  title?: string;
  year?: string;
};

type ArchiveFile = {
  name: string;
  format?: string;
  size?: string;
};

type CuratedEntry = {
  streamUrl: string;
  title: string;
  source: FilmStream['source'];
};

const CURATED_STREAMS: Record<number, CuratedEntry> = {
  351: {
    streamUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Nosferatu_%281922%29.webm',
    title: 'Nosferatu (1922)',
    source: 'commons',
  },
  328: {
    streamUrl: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
    title: 'Night of the Living Dead',
    source: 'archive',
  },
  444: {
    streamUrl: 'https://archive.org/download/metropolis1926/Metropolis.1927.512kb.mp4',
    title: 'Metropolis',
    source: 'archive',
  },
  8124: {
    streamUrl: 'https://archive.org/download/CC_1916_12_05_TheRink/512kb.mp4',
    title: 'Modern Times',
    source: 'archive',
  },
};

const FULL_FILM_MIN_BYTES = 120_000_000;

async function searchArchiveDocs(query: string, rows = 5): Promise<ArchiveDoc[]> {
  const url = new URL('https://archive.org/advancedsearch.php');
  url.searchParams.set('q', query);
  url.searchParams.append('fl[]', 'identifier');
  url.searchParams.append('fl[]', 'title');
  url.searchParams.append('fl[]', 'year');
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('output', 'json');

  const response = await fetchWithTimeout(url.toString(), { timeoutMs: 4000 });
  if (!response.ok) return [];

  const data = (await response.json()) as { response?: { docs?: ArchiveDoc[] } };
  return data.response?.docs ?? [];
}

function archiveQueries(title: string, year?: number) {
  const escaped = title.replace(/"/g, '');
  const withYear = year ? ` AND year:${year}` : '';
  return [
    `title:"${escaped}" AND mediatype:movies${withYear}`,
    `title:"${escaped}" trailer AND mediatype:movies`,
  ];
}

function archiveStreamUrl(identifier: string, fileName: string) {
  return `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;
}

function archiveFileLabel(fileName: string, size: number, docTitle: string) {
  if (/trailer|teaser|preview|promo/i.test(fileName)) return `${docTitle} · трейлер`;
  if (size >= FULL_FILM_MIN_BYTES) return `${docTitle} · полный фильм`;
  return `${docTitle} · ${fileName.replace(/\.[^.]+$/, '')}`;
}

async function listArchiveMediaItems(identifier: string, docTitle: string): Promise<MediaItem[]> {
  const response = await fetchWithTimeout(`https://archive.org/metadata/${identifier}`, { timeoutMs: 4000 });
  if (!response.ok) return [];

  const data = (await response.json()) as { files?: ArchiveFile[] };
  const files = (data.files ?? [])
    .filter((file) => /\.(mp4|mov|webm)$/i.test(file.name) && !/\.torrent$/i.test(file.name))
    .sort((a, b) => Number(b.size ?? 0) - Number(a.size ?? 0))
    .slice(0, 3);

  return files.map((file) => {
    const size = Number(file.size ?? 0);
    const streamUrl = archiveStreamUrl(identifier, file.name);
    const isFull = size >= FULL_FILM_MIN_BYTES;

    return {
      id: `archive-${identifier}-${file.name}`,
      title: archiveFileLabel(file.name, size, docTitle),
      url: streamUrl,
      kind: 'native' as const,
      embedUrl: null,
      streamUrl,
      type: isFull ? 'VIDEO' : 'TRAILER',
      typeLabel: isFull ? 'Открытый доступ' : 'Архив',
      site: 'ARCHIVE',
      source: 'archive' as const,
    };
  });
}

async function resolveArchiveStream(identifier: string, title: string): Promise<FilmStream | null> {
  const clips = await listArchiveMediaItems(identifier, title);
  const full = clips.find((clip) => clip.type === 'VIDEO' && clip.streamUrl);
  if (full?.streamUrl) {
    return {
      id: full.id,
      title: full.title,
      source: 'archive',
      streamUrl: full.streamUrl,
    };
  }

  const largest = clips.find((clip) => clip.streamUrl);
  if (!largest?.streamUrl) return null;

  return {
    id: largest.id,
    title: largest.title,
    source: 'archive',
    streamUrl: largest.streamUrl,
  };
}

function dedupeMediaItems(items: MediaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.streamUrl ?? item.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function curatedStream(filmId: number): FilmStream | null {
  const entry = CURATED_STREAMS[filmId];
  if (!entry) return null;

  return {
    id: `curated-${filmId}`,
    title: entry.title,
    source: entry.source,
    streamUrl: entry.streamUrl,
  };
}

export async function findFullFilmStream(
  filmId: number,
  titles: string[],
  year?: number,
): Promise<FilmStream | null> {
  const curated = curatedStream(filmId);
  if (curated) return curated;

  for (const title of titles) {
    const commons = await findCommonsClips(title, year);
    const full = commons.find((clip) => clip.streamUrl);
    if (full?.streamUrl) {
      return {
        id: full.id,
        title: full.title,
        source: 'commons',
        streamUrl: full.streamUrl,
      };
    }
  }

  for (const title of titles) {
    for (const query of archiveQueries(title, year)) {
      const docs = await searchArchiveDocs(query, 4);
      for (const doc of docs) {
        const stream = await resolveArchiveStream(doc.identifier, doc.title ?? title);
        if (stream) return stream;
      }
    }
  }

  return null;
}

export async function findAlternativeClips(titles: string[], year?: number): Promise<MediaItem[]> {
  const collected: MediaItem[] = [];

  for (const title of titles) {
    const commons = await findCommonsClips(title, year);
    collected.push(...commons);

    for (const query of archiveQueries(title, year)) {
      const docs = await searchArchiveDocs(query, 3);
      for (const doc of docs) {
        const items = await listArchiveMediaItems(doc.identifier, doc.title ?? title);
        collected.push(...items);
      }
    }
  }

  return dedupeMediaItems(collected).sort((a, b) => {
    if (a.type === 'VIDEO' && b.type !== 'VIDEO') return -1;
    if (b.type === 'VIDEO' && a.type !== 'VIDEO') return 1;
    return 0;
  });
}

export async function findFallbackNativeStream(clips: MediaItem[]): Promise<FilmStream | null> {
  const full = clips.find((clip) => clip.type === 'VIDEO' && clip.streamUrl);
  if (full?.streamUrl) {
    return {
      id: full.id ?? 'clip-full',
      title: full.title,
      source: full.source === 'commons' ? 'commons' : full.source === 'archive' ? 'archive' : 'native',
      streamUrl: full.streamUrl,
    };
  }

  const native = clips.find((clip) => clip.streamUrl);
  if (!native?.streamUrl) return null;

  return {
    id: native.id ?? 'native-fallback',
    title: native.title,
    source: native.source === 'commons' ? 'commons' : native.source === 'archive' ? 'archive' : 'native',
    streamUrl: native.streamUrl,
  };
}

import type { MediaItem } from '../types/film';
import { fetchWithTimeout } from './fetch';

type CommonsVideoInfo = {
  canonicaltitle?: string;
  url?: string;
  duration?: number;
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<
      string,
      {
        pageid?: number;
        title?: string;
        videoinfo?: CommonsVideoInfo[];
      }
    >;
  };
};

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogv|mov)(\?|$)/i.test(url);
}

export async function findCommonsClips(title: string, year?: number): Promise<MediaItem[]> {
  const query = [title, year?.toString()].filter(Boolean).join(' ');
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', `${query} filetype:video`);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '6');
  url.searchParams.set('prop', 'videoinfo');
  url.searchParams.set('viprop', 'url,duration,canonicaltitle');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetchWithTimeout(url.toString(), { timeoutMs: 5000 });
  if (!response.ok) return [];

  const data = (await response.json()) as CommonsSearchResponse;
  const pages = data.query?.pages ?? [];

  return Object.values(pages).flatMap((page) => {
    const video = page.videoinfo?.find((item) => item.url && isVideoUrl(item.url));
    if (!video?.url) return [];

    const label = video.canonicaltitle?.replace(/^File:/, '') ?? page.title?.replace(/^File:/, '') ?? title;

    return [
      {
        id: `commons-${page.pageid ?? video.url}`,
        title: label,
        url: video.url,
        kind: 'native' as const,
        embedUrl: null,
        streamUrl: video.url,
        type: 'VIDEO',
        typeLabel: 'Wikimedia',
        site: 'COMMONS',
        source: 'commons' as const,
      },
    ];
  });
}

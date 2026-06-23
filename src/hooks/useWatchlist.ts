import { useCallback, useEffect, useState } from 'react';
import { readWatchlist, toggleWatchlist as toggleInStorage } from '../lib/api';

export function useWatchlist() {
  const [ids, setIds] = useState<number[]>(() => readWatchlist());

  useEffect(() => {
    const sync = () => setIds(readWatchlist());
    window.addEventListener('videohost-watchlist-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('videohost-watchlist-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((filmId: number) => {
    toggleInStorage(filmId);
    setIds(readWatchlist());
  }, []);

  const remove = useCallback((filmId: number) => {
    if (!readWatchlist().includes(filmId)) return;
    toggleInStorage(filmId);
    setIds(readWatchlist());
  }, []);

  return { ids, toggle, remove, count: ids.length };
}

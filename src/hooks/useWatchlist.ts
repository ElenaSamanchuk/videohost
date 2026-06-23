import { useCallback, useEffect, useState } from 'react';
import type { FilmPreview, WatchlistEntry } from '../types/film';
import {
  readWatchlistEntries,
  removeFromWatchlist,
  toggleWatchlist as toggleInStorage,
} from '../lib/api';

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>(() => readWatchlistEntries());

  useEffect(() => {
    const sync = () => setEntries(readWatchlistEntries());
    window.addEventListener('videohost-watchlist-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('videohost-watchlist-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((filmId: number, snapshot?: FilmPreview) => {
    toggleInStorage(filmId, snapshot);
    setEntries(readWatchlistEntries());
  }, []);

  const remove = useCallback((filmId: number) => {
    removeFromWatchlist(filmId);
    setEntries(readWatchlistEntries());
  }, []);

  return {
    entries,
    ids: entries.map((entry) => entry.filmId),
    toggle,
    remove,
    count: entries.length,
  };
}

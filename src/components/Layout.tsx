import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';

export function Layout() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { count } = useWatchlist();

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) {
      navigate('/');
      return;
    }
    navigate(`/?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 pt-3 sm:pt-4 pointer-events-none">
        <div className="page-wrap pointer-events-auto">
          <div className="glass-bar rounded-2xl px-4 sm:px-5 h-14 flex items-center gap-4">
            <Link to="/" className="font-semibold tracking-tight shrink-0">
              Videohost
            </Link>
            <Link to="/list" className="btn-ghost shrink-0 relative">
              Мой список
              {count > 0 ? (
                <span className="ml-1 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
            <form onSubmit={onSearch} className="flex-1 max-w-md ml-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Найти фильм..."
                className="input-field h-10"
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

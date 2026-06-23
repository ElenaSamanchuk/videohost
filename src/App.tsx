import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { WatchPage } from './pages/WatchPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="list" element={<WatchlistPage />} />
        <Route path="watch/:filmId" element={<WatchPage />} />
      </Route>
    </Routes>
  );
}

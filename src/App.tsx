import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { WatchPage } from './pages/WatchPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="watch/:filmId" element={<WatchPage />} />
      </Route>
    </Routes>
  );
}

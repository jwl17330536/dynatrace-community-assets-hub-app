import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AppRoot } from '@dynatrace/strato-components-preview';
import { Catalog } from './pages/Catalog';
import { ItemDetail } from './pages/ItemDetail';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AppRoot>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/item/:owner/:repo/:folder" element={<ItemDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}

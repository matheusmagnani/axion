import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@shared/components/Layout/Layout';
import { AssociatesPage } from '@modules/associates/pages/AssociatesPage';
import { BillingsPage } from '@modules/billings/pages/BillingsPage';
import { CollaboratorsPage } from '@modules/collaborators/pages/CollaboratorsPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/associates" replace />} />
          <Route path="associates" element={<AssociatesPage />} />
          <Route path="dashboard" element={<div className="p-10 text-secondary">Dashboard (under development)</div>} />
          <Route path="billings" element={<BillingsPage />} />
          <Route path="connections" element={<div className="p-10 text-secondary">Connections (under development)</div>} />
          <Route path="collaborators" element={<CollaboratorsPage />} />
          <Route path="settings" element={<div className="p-10 text-secondary">Settings (under development)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

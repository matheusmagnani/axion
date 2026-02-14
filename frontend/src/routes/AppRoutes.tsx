import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@shared/components/Layout/Layout';
import { AssociatesPage } from '@modules/associates/pages/AssociatesPage';
import { BillingsPage } from '@modules/billings/pages/BillingsPage';
import { CollaboratorsPage } from '@modules/collaborators/pages/CollaboratorsPage';
import { SettingsPage } from '@modules/settings/pages/SettingsPage';
import { LoginPage } from '@modules/auth/pages/LoginPage';
import { authService } from '@modules/auth/services/authService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authService.isAuthenticated()
              ? <Navigate to="/associates" replace />
              : <LoginPage />
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/associates" replace />} />
          <Route path="associates" element={<AssociatesPage />} />
          <Route path="dashboard" element={<div className="p-10 text-app-secondary">Dashboard (em desenvolvimento)</div>} />
          <Route path="billings" element={<BillingsPage />} />
          <Route path="connections" element={<div className="p-10 text-app-secondary">Conexões (em desenvolvimento)</div>} />
          <Route path="collaborators" element={<CollaboratorsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

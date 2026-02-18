import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@shared/components/Layout/Layout';
import { AssociatesPage } from '@modules/associates/pages/AssociatesPage';
import { AssociateDetailPage } from '@modules/associates/pages/AssociateDetailPage';
import { BillingsPage } from '@modules/billings/pages/BillingsPage';
import { CollaboratorsPage } from '@modules/collaborators/pages/CollaboratorsPage';
import { SettingsPage } from '@modules/settings/pages/SettingsPage';
import { LoginPage } from '@modules/auth/pages/LoginPage';
import { authService } from '@modules/auth/services/authService';
import { useCanAccess } from '@shared/hooks/useMyPermissions';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PermissionRoute({ module, children }: { module: string; children: React.ReactNode }) {
  const canRead = useCanAccess(module, 'read');
  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
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
          <Route path="associates" element={<PermissionRoute module="associates"><AssociatesPage /></PermissionRoute>} />
          <Route path="associates/:id" element={<PermissionRoute module="associates"><AssociateDetailPage /></PermissionRoute>} />
          <Route path="dashboard" element={<div className="p-10 text-app-secondary">Dashboard (em desenvolvimento)</div>} />
          <Route path="billings" element={<PermissionRoute module="billings"><BillingsPage /></PermissionRoute>} />
          <Route path="connections" element={<PermissionRoute module="connections"><div className="p-10 text-app-secondary">Conexões (em desenvolvimento)</div></PermissionRoute>} />
          <Route path="collaborators" element={<PermissionRoute module="collaborators"><CollaboratorsPage /></PermissionRoute>} />
          <Route path="settings" element={<PermissionRoute module="settings"><SettingsPage /></PermissionRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

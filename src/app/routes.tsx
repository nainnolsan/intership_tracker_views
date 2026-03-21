import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import App from '../App';
import { hasAccessToken, redirectToCentralLogin } from '../auth/session';
import ApplicationsPage from '../pages/ApplicationsPage';
import DashboardPage from '../pages/DashboardPage';
import EmailCenterPage from '../pages/EmailCenterPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (hasAccessToken()) {
    return <>{children}</>;
  }

  const returnTo = `${window.location.origin}${location.pathname}${location.search}`;
  redirectToCentralLogin(returnTo);
  return null;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={(
          <RequireAuth>
            <App />
          </RequireAuth>
        )}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="email-center" element={<EmailCenterPage />} />
      </Route>
    </Routes>
  );
}

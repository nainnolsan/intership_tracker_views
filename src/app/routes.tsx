import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App';
import AnalyticsPage from '../pages/AnalyticsPage';
import ApplicationsPage from '../pages/ApplicationsPage';
import DashboardPage from '../pages/DashboardPage';
import EmailCenterPage from '../pages/EmailCenterPage';
import PipelineBoardPage from '../pages/PipelineBoardPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="pipeline" element={<PipelineBoardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="email-center" element={<EmailCenterPage />} />
      </Route>
    </Routes>
  );
}

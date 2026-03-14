import { apiFetch } from '../../../api/httpClient';
import type {
  AnalyticsOverviewDTO,
  ApplicationDTO,
  ApplicationFiltersDTO,
  CreateApplicationDTO,
  DashboardMetricsDTO,
  EmailCenterDTO,
  FunnelFlowDTO,
  PipelineColumnDTO,
  UpdateApplicationDTO,
} from '../../../types/internships';

const basePath = '/api/internships';

export const internshipsApi = {
  getDashboardMetrics: () => apiFetch<DashboardMetricsDTO>(`${basePath}/dashboard/metrics`),
  getFunnelFlow: () => apiFetch<FunnelFlowDTO>(`${basePath}/dashboard/funnel`),
  getApplications: (filters: ApplicationFiltersDTO) =>
    apiFetch<ApplicationDTO[]>(`${basePath}/applications`, {
      query: {
        stage: filters.stage && filters.stage !== 'All' ? filters.stage : undefined,
        company: filters.company,
        roleType: filters.roleType && filters.roleType !== 'All' ? filters.roleType : undefined,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        q: filters.q,
      },
    }),
  createApplication: (payload: CreateApplicationDTO) =>
    apiFetch<ApplicationDTO>(`${basePath}/applications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateApplication: (id: string, payload: UpdateApplicationDTO) =>
    apiFetch<ApplicationDTO>(`${basePath}/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getPipelineBoard: () => apiFetch<PipelineColumnDTO[]>(`${basePath}/pipeline`),
  getAnalyticsOverview: () => apiFetch<AnalyticsOverviewDTO>(`${basePath}/analytics/overview`),
  getEmailCenter: () => apiFetch<EmailCenterDTO>(`${basePath}/emails`),
  connectEmailProvider: (provider: 'gmail' | 'outlook') =>
    apiFetch<{ redirectUrl: string }>(`${basePath}/emails/connect/${provider}`, { method: 'POST' }),
};

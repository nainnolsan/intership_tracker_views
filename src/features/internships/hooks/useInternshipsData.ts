import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { internshipsApi } from '../api/internshipsApi';
import { mockAnalytics, mockApplications, mockEmailCenter, mockFunnel, mockMetrics, mockPipeline } from '../api/mockData';
import type { ApplicationFiltersDTO, CreateApplicationDTO, UpdateApplicationDTO } from '../../../types/internships';

const queryKeys = {
  metrics: ['internships', 'metrics'] as const,
  funnel: ['internships', 'funnel'] as const,
  applications: (filters: ApplicationFiltersDTO) => ['internships', 'applications', filters] as const,
  pipeline: ['internships', 'pipeline'] as const,
  analytics: ['internships', 'analytics'] as const,
  emails: ['internships', 'emails'] as const,
};

const withMockFallback = async <T>(apiRequest: () => Promise<T>, mockData: T): Promise<T> => {
  try {
    return await apiRequest();
  } catch {
    return mockData;
  }
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.metrics,
    queryFn: () => withMockFallback(internshipsApi.getDashboardMetrics, mockMetrics),
  });
}

export function useFunnelFlow() {
  return useQuery({
    queryKey: queryKeys.funnel,
    queryFn: () => withMockFallback(internshipsApi.getFunnelFlow, mockFunnel),
  });
}

export function useApplications(filters: ApplicationFiltersDTO) {
  return useQuery({
    queryKey: queryKeys.applications(filters),
    queryFn: () => withMockFallback(() => internshipsApi.getApplications(filters), mockApplications),
  });
}

export function usePipelineBoard() {
  return useQuery({
    queryKey: queryKeys.pipeline,
    queryFn: () => withMockFallback(internshipsApi.getPipelineBoard, mockPipeline),
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => withMockFallback(internshipsApi.getAnalyticsOverview, mockAnalytics),
  });
}

export function useEmailCenter() {
  return useQuery({
    queryKey: queryKeys.emails,
    queryFn: () => withMockFallback(internshipsApi.getEmailCenter, mockEmailCenter),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApplicationDTO) => internshipsApi.createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships', 'applications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApplicationDTO }) => internshipsApi.updateApplication(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships', 'applications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

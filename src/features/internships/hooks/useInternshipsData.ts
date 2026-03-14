import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_DASHBOARD_METRICS,
  GET_FUNNEL_FLOW,
  GET_APPLICATIONS,
  GET_PIPELINE,
  GET_ANALYTICS_OVERVIEW,
  GET_EMAIL_CENTER,
} from '../../../graphql/internshipQueries';
import {
  CREATE_INTERNSHIP_APPLICATION,
  UPDATE_INTERNSHIP_APPLICATION,
  CONNECT_EMAIL_PROVIDER,
} from '../../../graphql/internshipMutations';
import type {
  ApplicationDTO,
  ApplicationFiltersDTO,
  ApplicationStage,
  AnalyticsOverviewDTO,
  CreateApplicationDTO,
  DashboardMetricsDTO,
  EmailCenterDTO,
  FunnelFlowDTO,
  PipelineColumnDTO,
  RoleType,
  UpdateApplicationDTO,
} from '../../../types/internships';

// ── GraphQL response shapes ──────────────────────────────────────────────────
interface DashboardMetricsResponse { internshipDashboardMetrics: DashboardMetricsDTO }
interface FunnelFlowResponse       { internshipFunnelFlow: FunnelFlowDTO }
interface ApplicationsResponse     { internshipApplications: ApplicationDTO[] }
interface PipelineResponse         { internshipPipeline: PipelineColumnDTO[] }
interface AnalyticsResponse        { internshipAnalyticsOverview: AnalyticsOverviewDTO }
interface EmailCenterResponse      { internshipEmailCenter: EmailCenterDTO }
interface ApplicationMutationResponse { createInternshipApplication: ApplicationDTO }
interface UpdateMutationResponse      { updateInternshipApplication: ApplicationDTO }
interface ConnectProviderResponse     { connectInternshipEmailProvider: { redirectUrl: string } }

interface ApplicationsVariables    { filters?: Partial<{ stage: ApplicationStage; company: string; roleType: RoleType; fromDate: string; toDate: string; q: string }> }
interface CreateApplicationVariables { input: CreateApplicationDTO }
interface UpdateApplicationVariables { id: string; input: UpdateApplicationDTO }
interface ConnectProviderVariables   { provider: 'gmail' | 'outlook' }

// ── Refetch list after mutations ─────────────────────────────────────────────
const refetchQueries = [
  { query: GET_APPLICATIONS },
  { query: GET_DASHBOARD_METRICS },
  { query: GET_PIPELINE },
  { query: GET_ANALYTICS_OVERVIEW },
];

// ── Query hooks ──────────────────────────────────────────────────────────────
export function useDashboardMetrics() {
  const { data, loading, error } = useQuery<DashboardMetricsResponse>(GET_DASHBOARD_METRICS);
  return { data: data?.internshipDashboardMetrics, loading, error };
}

export function useFunnelFlow() {
  const { data, loading, error } = useQuery<FunnelFlowResponse>(GET_FUNNEL_FLOW);
  return { data: data?.internshipFunnelFlow, loading, error };
}

export function useApplications(filters: ApplicationFiltersDTO) {
  const gqlFilters: ApplicationsVariables['filters'] = {
    stage: filters.stage && filters.stage !== 'All' ? (filters.stage as ApplicationStage) : undefined,
    company: filters.company || undefined,
    roleType: filters.roleType && filters.roleType !== 'All' ? (filters.roleType as RoleType) : undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    q: filters.q || undefined,
  };

  const { data, loading, error } = useQuery<ApplicationsResponse, ApplicationsVariables>(GET_APPLICATIONS, {
    variables: { filters: gqlFilters },
  });
  return { data: data?.internshipApplications, loading, error };
}

export function usePipelineBoard() {
  const { data, loading, error } = useQuery<PipelineResponse>(GET_PIPELINE);
  return { data: data?.internshipPipeline, loading, error };
}

export function useAnalyticsOverview() {
  const { data, loading, error } = useQuery<AnalyticsResponse>(GET_ANALYTICS_OVERVIEW);
  return { data: data?.internshipAnalyticsOverview, loading, error };
}

export function useEmailCenter() {
  const { data, loading, error } = useQuery<EmailCenterResponse>(GET_EMAIL_CENTER);
  return { data: data?.internshipEmailCenter, loading, error };
}

// ── Mutation hooks ───────────────────────────────────────────────────────────
export function useCreateApplication() {
  const [execute, result] = useMutation<ApplicationMutationResponse, CreateApplicationVariables>(
    CREATE_INTERNSHIP_APPLICATION,
    { refetchQueries },
  );
  const mutateAsync = (payload: CreateApplicationDTO) =>
    execute({ variables: { input: payload } });
  return { ...result, mutateAsync };
}

export function useUpdateApplication() {
  const [execute, result] = useMutation<UpdateMutationResponse, UpdateApplicationVariables>(
    UPDATE_INTERNSHIP_APPLICATION,
    { refetchQueries },
  );
  const mutateAsync = ({ id, payload }: { id: string; payload: UpdateApplicationDTO }) =>
    execute({ variables: { id, input: payload } });
  return { ...result, mutateAsync };
}

export function useConnectEmailProvider() {
  const [execute, result] = useMutation<ConnectProviderResponse, ConnectProviderVariables>(
    CONNECT_EMAIL_PROVIDER,
  );
  const mutateAsync = (provider: 'gmail' | 'outlook') =>
    execute({ variables: { provider } });
  return { ...result, mutateAsync };
}




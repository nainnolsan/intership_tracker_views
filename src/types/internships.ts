export const applicationStages = ['Applied', 'OnlineAssessment', 'Interview', 'Offer', 'Rejected'] as const;
export type ApplicationStage = (typeof applicationStages)[number];

export const roleTypes = ['Internship', 'FullTime', 'PartTime', 'Contract'] as const;
export type RoleType = (typeof roleTypes)[number];

export interface ApplicationDTO {
  id: string;
  company: string;
  roleTitle: string;
  roleType: RoleType;
  stage: ApplicationStage;
  appliedAt: string;
  lastUpdatedAt: string;
  location?: string;
  source?: string;
  salaryRange?: string;
  notes?: string;
  contactEmail?: string;
}

export interface DashboardMetricsDTO {
  totalApplied: number;
  totalOnlineAssessments: number;
  totalInterviews: number;
  totalOffers: number;
  totalRejected: number;
  conversionRate: number;
}

export interface FunnelNodeDTO {
  name: string;
}

export interface FunnelLinkDTO {
  source: number;
  target: number;
  value: number;
}

export interface FunnelFlowDTO {
  nodes: FunnelNodeDTO[];
  links: FunnelLinkDTO[];
}

export interface ApplicationFiltersDTO {
  stage?: ApplicationStage | 'All';
  company?: string;
  roleType?: RoleType | 'All';
  fromDate?: string;
  toDate?: string;
  q?: string;
}

export interface CreateApplicationDTO {
  company: string;
  roleTitle: string;
  roleType: RoleType;
  stage: ApplicationStage;
  appliedAt: string;
  location?: string;
  source?: string;
  salaryRange?: string;
  notes?: string;
  contactEmail?: string;
}

export interface UpdateApplicationDTO extends Partial<CreateApplicationDTO> {}

export interface PipelineColumnDTO {
  stage: ApplicationStage;
  total: number;
  applications: ApplicationDTO[];
}

export interface DailyApplicationsPointDTO {
  date: string;
  applied: number;
  interview: number;
  offer: number;
}

export interface StageDistributionItemDTO {
  stage: ApplicationStage;
  value: number;
}

export interface AnalyticsOverviewDTO {
  daily: DailyApplicationsPointDTO[];
  stageDistribution: StageDistributionItemDTO[];
}

export type EmailProvider = 'gmail' | 'outlook';

export interface EmailConnectorStatusDTO {
  provider: EmailProvider;
  connected: boolean;
  authUrl?: string;
  lastSyncAt?: string;
}

export interface EmailThreadDTO {
  id: string;
  subject: string;
  company: string;
  snippet: string;
  receivedAt: string;
  stageHint?: ApplicationStage;
}

export interface EmailCenterDTO {
  connectors: EmailConnectorStatusDTO[];
  threads: EmailThreadDTO[];
}

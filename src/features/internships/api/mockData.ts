import type {
  AnalyticsOverviewDTO,
  ApplicationDTO,
  DashboardMetricsDTO,
  EmailCenterDTO,
  FunnelFlowDTO,
  PipelineColumnDTO,
} from '../../../types/internships';

const now = new Date().toISOString();

export const mockApplications: ApplicationDTO[] = [
  {
    id: '1',
    company: 'Stripe',
    roleTitle: 'Software Engineer Intern',
    roleType: 'Internship',
    stage: 'Interview',
    appliedAt: '2026-02-02',
    lastUpdatedAt: now,
    location: 'Remote',
    source: 'LinkedIn',
    contactEmail: 'recruiting@stripe.com',
  },
  {
    id: '2',
    company: 'Datadog',
    roleTitle: 'Backend Engineer',
    roleType: 'FullTime',
    stage: 'OnlineAssessment',
    appliedAt: '2026-02-09',
    lastUpdatedAt: now,
    location: 'NYC',
    source: 'Company Career Site',
  },
  {
    id: '3',
    company: 'Notion',
    roleTitle: 'Frontend Intern',
    roleType: 'Internship',
    stage: 'Offer',
    appliedAt: '2026-01-21',
    lastUpdatedAt: now,
    location: 'SF',
    source: 'Referral',
  },
  {
    id: '4',
    company: 'Mercado Libre',
    roleTitle: 'Platform Engineer',
    roleType: 'FullTime',
    stage: 'Rejected',
    appliedAt: '2026-01-15',
    lastUpdatedAt: now,
    source: 'LinkedIn',
  },
  {
    id: '5',
    company: 'GitHub',
    roleTitle: 'Software Engineer',
    roleType: 'FullTime',
    stage: 'Applied',
    appliedAt: '2026-03-05',
    lastUpdatedAt: now,
    location: 'Remote',
    source: 'Company Career Site',
  },
];

export const mockMetrics: DashboardMetricsDTO = {
  totalApplied: 32,
  totalOnlineAssessments: 14,
  totalInterviews: 7,
  totalOffers: 2,
  totalRejected: 11,
  conversionRate: 6.25,
};

export const mockFunnel: FunnelFlowDTO = {
  nodes: [{ name: 'Applied' }, { name: 'OA' }, { name: 'Interview' }, { name: 'Offer' }, { name: 'Rejected' }],
  links: [
    { source: 0, target: 1, value: 14 },
    { source: 1, target: 2, value: 7 },
    { source: 2, target: 3, value: 2 },
    { source: 2, target: 4, value: 4 },
    { source: 0, target: 4, value: 7 },
  ],
};

export const mockPipeline: PipelineColumnDTO[] = [
  { stage: 'Applied', total: 10, applications: mockApplications.filter((a) => a.stage === 'Applied') },
  { stage: 'OnlineAssessment', total: 7, applications: mockApplications.filter((a) => a.stage === 'OnlineAssessment') },
  { stage: 'Interview', total: 5, applications: mockApplications.filter((a) => a.stage === 'Interview') },
  { stage: 'Offer', total: 2, applications: mockApplications.filter((a) => a.stage === 'Offer') },
  { stage: 'Rejected', total: 8, applications: mockApplications.filter((a) => a.stage === 'Rejected') },
];

export const mockAnalytics: AnalyticsOverviewDTO = {
  daily: [
    { date: '2026-02-25', applied: 2, interview: 0, offer: 0 },
    { date: '2026-02-26', applied: 3, interview: 1, offer: 0 },
    { date: '2026-02-27', applied: 1, interview: 0, offer: 0 },
    { date: '2026-02-28', applied: 4, interview: 1, offer: 1 },
    { date: '2026-03-01', applied: 2, interview: 1, offer: 0 },
    { date: '2026-03-02', applied: 3, interview: 2, offer: 0 },
    { date: '2026-03-03', applied: 1, interview: 1, offer: 1 },
  ],
  stageDistribution: [
    { stage: 'Applied', value: 10 },
    { stage: 'OnlineAssessment', value: 7 },
    { stage: 'Interview', value: 5 },
    { stage: 'Offer', value: 2 },
    { stage: 'Rejected', value: 8 },
  ],
};

export const mockEmailCenter: EmailCenterDTO = {
  connectors: [
    { provider: 'gmail', connected: false, authUrl: '/oauth/gmail' },
    { provider: 'outlook', connected: false, authUrl: '/oauth/outlook' },
  ],
  threads: [
    {
      id: 'mail-1',
      subject: 'Next steps for your interview loop',
      company: 'Stripe',
      snippet: 'Thanks for completing the OA. We would like to schedule a technical interview.',
      receivedAt: '2026-03-01T13:00:00Z',
      stageHint: 'Interview',
    },
    {
      id: 'mail-2',
      subject: 'Application update',
      company: 'Mercado Libre',
      snippet: 'We appreciate your time. At this moment we are moving forward with other candidates.',
      receivedAt: '2026-02-27T08:30:00Z',
      stageHint: 'Rejected',
    },
  ],
};

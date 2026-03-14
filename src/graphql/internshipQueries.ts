import { gql } from '@apollo/client';

export const INTERNSHIP_APPLICATION_FIELDS = gql`
  fragment InternshipApplicationFields on InternshipApplication {
    id
    company
    roleTitle
    roleType
    stage
    appliedAt
    lastUpdatedAt
    location
    source
    salaryRange
    notes
    contactEmail
  }
`;

export const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics {
    internshipDashboardMetrics {
      totalApplied
      totalOnlineAssessments
      totalInterviews
      totalOffers
      totalRejected
      conversionRate
    }
  }
`;

export const GET_FUNNEL_FLOW = gql`
  query GetFunnelFlow {
    internshipFunnelFlow {
      nodes {
        name
      }
      links {
        source
        target
        value
      }
    }
  }
`;

export const GET_APPLICATIONS = gql`
  query GetApplications($filters: InternshipApplicationFiltersInput) {
    internshipApplications(filters: $filters) {
      id
      company
      roleTitle
      roleType
      stage
      appliedAt
      lastUpdatedAt
      location
      source
      salaryRange
      notes
      contactEmail
    }
  }
`;

export const GET_PIPELINE = gql`
  query GetPipeline {
    internshipPipeline {
      stage
      total
      applications {
        id
        company
        roleTitle
        roleType
        stage
        appliedAt
        lastUpdatedAt
        location
        source
        salaryRange
        notes
        contactEmail
      }
    }
  }
`;

export const GET_ANALYTICS_OVERVIEW = gql`
  query GetAnalyticsOverview {
    internshipAnalyticsOverview {
      daily {
        date
        applied
        interview
        offer
      }
      stageDistribution {
        stage
        value
      }
    }
  }
`;

export const GET_EMAIL_CENTER = gql`
  query GetEmailCenter {
    internshipEmailCenter {
      connectors {
        provider
        connected
        authUrl
        lastSyncAt
      }
      threads {
        id
        subject
        company
        snippet
        receivedAt
        stageHint
      }
    }
  }
`;

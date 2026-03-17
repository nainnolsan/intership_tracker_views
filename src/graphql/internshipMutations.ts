import { gql } from '@apollo/client';

export const CREATE_INTERNSHIP_APPLICATION = gql`
  mutation CreateInternshipApplication($input: CreateInternshipApplicationInput!) {
    createInternshipApplication(input: $input) {
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

export const UPDATE_INTERNSHIP_APPLICATION = gql`
  mutation UpdateInternshipApplication($id: ID!, $input: UpdateInternshipApplicationInput!) {
    updateInternshipApplication(id: $id, input: $input) {
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

export const ADD_INTERNSHIP_STAGE_EVENT = gql`
  mutation AddInternshipStageEvent($id: ID!, $input: AddInternshipStageEventInput!) {
    addInternshipStageEvent(id: $id, input: $input) {
      id
      fromStage
      toStage
      eventDate
      notes
    }
  }
`;

export const CONNECT_EMAIL_PROVIDER = gql`
  mutation ConnectEmailProvider($provider: EmailProvider!) {
    connectInternshipEmailProvider(provider: $provider) {
      redirectUrl
    }
  }
`;

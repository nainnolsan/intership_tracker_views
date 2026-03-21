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

export const UPDATE_INTERNSHIP_STAGE_EVENT = gql`
  mutation UpdateInternshipStageEvent($id: ID!, $eventId: ID!, $input: AddInternshipStageEventInput!) {
    updateInternshipStageEvent(id: $id, eventId: $eventId, input: $input) {
      id
      fromStage
      toStage
      eventDate
      notes
    }
  }
`;

export const DELETE_INTERNSHIP_STAGE_EVENT = gql`
  mutation DeleteInternshipStageEvent($id: ID!, $eventId: ID!) {
    deleteInternshipStageEvent(id: $id, eventId: $eventId) {
      success
      message
    }
  }
`;

export const DELETE_INTERNSHIP_APPLICATION = gql`
  mutation DeleteInternshipApplication($id: ID!) {
    deleteInternshipApplication(id: $id) {
      success
      message
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

export const SAVE_STAGE_LAYOUT = gql`
  mutation SaveStageLayout($layout: [StageLayoutItemInput!]!) {
    saveInternshipStageLayout(layout: $layout) {
      success
      message
    }
  }
`;

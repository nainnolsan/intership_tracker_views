import { gql } from '@apollo/client';

export const UPDATE_SCRAPING_PREFERENCES = gql`
  mutation UpdateScrapingPreferences($preferences: [ScrapingPreferenceInput!]!) {
    updateScrapingPreferences(preferences: $preferences) {
      success
      message
    }
  }
`;

export const SWIPE_JOB = gql`
  mutation SwipeJob(
    $jobId: String!
    $status: String!
    $companyName: String
    $roleTitle: String
    $location: String
    $url: String
  ) {
    swipeJob(
      jobId: $jobId
      status: $status
      companyName: $companyName
      roleTitle: $roleTitle
      location: $location
      url: $url
    ) {
      success
      message
    }
  }
`;

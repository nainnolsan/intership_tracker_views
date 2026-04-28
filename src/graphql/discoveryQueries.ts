import { gql } from '@apollo/client';

export const GET_SCRAPED_JOBS = gql`
  query GetScrapedJobs($keyword: String, $location: String) {
    scrapedJobs(keyword: $keyword, location: $location) {
      _id
      title
      company
      location
      link
      platform
      description
      postedDate
      extractedAt
    }
  }
`;

export const GET_SWIPE_HISTORY = gql`
  query GetSwipeHistory {
    swipeHistory {
      job_id
      status
    }
  }
`;

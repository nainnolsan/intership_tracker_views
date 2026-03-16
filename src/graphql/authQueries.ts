import { gql } from '@apollo/client';

export const GET_PROFILE_QUERY = gql`
  query GetProfile {
    me {
      success
      message
      data {
        id
        name
        email
        createdAt
      }
    }
  }
`;

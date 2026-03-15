import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { onError } from '@apollo/client/link/error';
import { clearSession, redirectToCentralLogin } from '../auth/session';

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000'}/graphql`,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accessToken');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

const errorLink = onError(({ error }) => {
  const unauthenticated =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphqlError) =>
        graphqlError.extensions?.code === 'UNAUTHENTICATED' ||
        graphqlError.message.includes('No est'),
    );

  if (!unauthenticated) {
    return;
  }

  clearSession();
  const returnTo = window.location.href;
  redirectToCentralLogin(returnTo);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

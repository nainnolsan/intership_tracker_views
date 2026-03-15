const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const AUTH_APP_URL = import.meta.env.VITE_AUTH_APP_URL ?? 'https://viewsportfolio.vercel.app';

export const hasAccessToken = (): boolean => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));

export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const bootstrapSessionFromUrl = (): void => {
  const url = new URL(window.location.href);
  const accessToken = url.searchParams.get(ACCESS_TOKEN_KEY);
  const refreshToken = url.searchParams.get(REFRESH_TOKEN_KEY);

  let changed = false;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    url.searchParams.delete(ACCESS_TOKEN_KEY);
    changed = true;
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    url.searchParams.delete(REFRESH_TOKEN_KEY);
    changed = true;
  }

  if (changed) {
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
};

export const buildCentralLoginUrl = (returnTo: string): string => {
  const loginUrl = new URL('/', AUTH_APP_URL);
  loginUrl.searchParams.set('auth', 'login');
  loginUrl.searchParams.set('redirect', returnTo);
  return loginUrl.toString();
};

export const redirectToCentralLogin = (returnTo: string): void => {
  window.location.assign(buildCentralLoginUrl(returnTo));
};

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const AUTH_APP_URL = import.meta.env.VITE_AUTH_APP_URL ?? 'https://viewsportfolio.vercel.app';

export const hasAccessToken = (): boolean => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));

export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

interface SessionProfile {
  displayName: string;
  email?: string;
  initials: string;
}

const readAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

const decodeJwtPayload = (token: string): Record<string, unknown> | undefined => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return undefined;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

const toTitleCaseWords = (input: string): string =>
  input
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const buildInitials = (name: string): string => {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'U';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getSessionProfile = (): SessionProfile => {
  const token = readAccessToken();
  const payload = token ? decodeJwtPayload(token) : undefined;

  const rawName = typeof payload?.name === 'string' ? payload.name : undefined;
  const email = typeof payload?.email === 'string' ? payload.email : undefined;

  const displayName =
    rawName?.trim() ||
    (email ? toTitleCaseWords(email.split('@')[0]) : 'User');

  return {
    displayName,
    email,
    initials: buildInitials(displayName),
  };
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

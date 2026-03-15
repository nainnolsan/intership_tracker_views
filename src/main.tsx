import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';
import { bootstrapSessionFromUrl } from './auth/session';
import './index.css';

bootstrapSessionFromUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </StrictMode>,
);

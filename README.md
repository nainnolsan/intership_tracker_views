# Internship and Jobs Tracker Views

Frontend module for internship and job application tracking, built with React, TypeScript, and Vite.

This project is fully isolated in this folder and integrates only through API Gateway.

## Included Views

- Dashboard
- Applications
- Pipeline Board
- Analytics
- Email Center

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- React Query
- Recharts

## Setup

1. Install dependencies
   npm install

2. Configure environment
   Copy .env.example to .env and set VITE_API_GATEWAY_URL

3. Start development server
   npm run dev

4. Build for production
   npm run build

## Documentation

- docs/IMPLEMENTATION-PLAN.md
- docs/API-CONTRACT.md
- docs/FOLDER-STRUCTURE.md
- docs/UI-TEST-CHECKLIST.md

## Integration Rule

Do not call internal services directly from frontend.
All data access must go through API Gateway endpoints documented in docs/API-CONTRACT.md.

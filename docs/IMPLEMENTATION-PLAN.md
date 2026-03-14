# Internship Tracker Frontend - Implementation Plan

## Stage 1: Foundation
- Bootstrap isolated Vite + React + TypeScript project.
- Configure app shell, routing, and React Query provider.
- Define environment variable contract (`VITE_API_GATEWAY_URL`).

## Stage 2: Domain Contract
- Define DTOs for applications, funnel, analytics, and emails.
- Implement API client and internships gateway adapter.
- Add mock fallback data for local UI development when backend is unavailable.

## Stage 3: Core Views
- Dashboard with KPI cards + Sankey flow.
- Applications page with filters, data table, and create/edit modal form.
- Pipeline Board with stage-based columns.

## Stage 4: Insight Views
- Analytics page with trends and stage distribution charts.
- Email Center with connectors and recruiter thread center.
- Keep connector model provider-agnostic for Gmail/Outlook OAuth.

## Stage 5: Hardening
- Add query invalidation strategy after create/update actions.
- Validate responsive behavior for desktop/tablet/mobile breakpoints.
- Add loading/error states and empty-state UX polish.

## Stage 6: Integration & QA
- Connect to API Gateway in non-mock environment.
- Execute UI checklist and regression testing.
- Verify route-level navigation, filters, and mutation flows.

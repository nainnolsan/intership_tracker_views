# UI Test Checklist

## Navigation
- [ ] Dashboard, Applications, Pipeline Board, Analytics, and Email Center routes load.
- [ ] Active navigation link highlights correctly.
- [ ] Layout remains usable on desktop, tablet, and mobile widths.

## Dashboard
- [ ] KPI cards render values from API response.
- [ ] Sankey diagram renders nodes/links correctly.
- [ ] Empty and API fallback states are visible and understandable.

## Applications
- [ ] Filters by stage, company, date range, role type, and free-text search work.
- [ ] New application modal validates required fields.
- [ ] Create flow triggers API call and refreshes list.
- [ ] Edit flow updates selected application and refreshes list.

## Pipeline Board
- [ ] Columns match expected stage order.
- [ ] Counts and cards are consistent with backend data.
- [ ] Horizontal scrolling works on narrow screens.

## Analytics
- [ ] Daily line chart displays applied/interview/offer trends.
- [ ] Stage distribution pie and bar charts render expected values.
- [ ] Chart containers are responsive and not clipped.

## Email Center
- [ ] Gmail and Outlook connector cards render current status.
- [ ] Connect action opens redirect URL from API response.
- [ ] Thread list displays subject, company, time, and snippet.

## Quality
- [ ] Loading states appear during fetch and mutation actions.
- [ ] Error states are surfaced in a user-friendly way.
- [ ] Keyboard focus is visible for interactive controls.
- [ ] Buttons, inputs, and text remain readable in mobile viewport.

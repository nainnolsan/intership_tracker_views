import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import { useDashboardMetrics, useFunnelFlow } from '../features/internships/hooks/useInternshipsData';

const DASHBOARD_ACCENT_STORAGE_KEY = 'dashboardAccentColor';
const ACCENT_PRESETS = ['#22c55e', '#3b82f6', '#f97316', '#e11d48'];

const readStoredAccent = (): string => {
  if (typeof window === 'undefined') {
    return ACCENT_PRESETS[0];
  }

  const stored = localStorage.getItem(DASHBOARD_ACCENT_STORAGE_KEY);
  return stored || ACCENT_PRESETS[0];
};

export default function DashboardPage() {
  const [accentColor, setAccentColor] = useState<string>(readStoredAccent);
  const metricsQuery = useDashboardMetrics();
  const funnelQuery = useFunnelFlow();

  const metrics = metricsQuery.data;
  const viewStyle = useMemo(
    () => ({ '--dashboard-accent': accentColor } as CSSProperties),
    [accentColor],
  );

  const updateAccentColor = (value: string) => {
    setAccentColor(value);
    localStorage.setItem(DASHBOARD_ACCENT_STORAGE_KEY, value);
  };

  return (
    <section className="view dashboard-view" style={viewStyle}>
      <PageHeader
        title="Dashboard"
        subtitle="Track your internship and job pipeline performance in one place."
        action={
          <details className="color-menu">
            <summary className="btn btn-ghost color-menu-trigger" aria-label="Customize dashboard color">
              <span className="color-menu-dots" aria-hidden="true">...</span>
            </summary>
            <div className="color-menu-popover">
              <p>Accent Color</p>
              <div className="color-preset-row">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`color-swatch ${accentColor.toLowerCase() === preset ? 'active' : ''}`}
                    style={{ backgroundColor: preset }}
                    onClick={() => updateAccentColor(preset)}
                    aria-label={`Select color ${preset}`}
                  />
                ))}
              </div>
              <label className="color-picker-label">
                Custom
                <input
                  type="color"
                  value={accentColor}
                  onChange={(event) => updateAccentColor(event.target.value)}
                />
              </label>
            </div>
          </details>
        }
      />

      <div className="metric-grid">
        <MetricCard label="Total Applied" value={metrics?.totalApplied ?? '-'} />
        <MetricCard label="OA" value={metrics?.totalOnlineAssessments ?? '-'} tone="accent" />
        <MetricCard label="Interviews" value={metrics?.totalInterviews ?? '-'} tone="accent" />
        <MetricCard label="Offers" value={metrics?.totalOffers ?? '-'} tone="success" />
        <MetricCard label="Rejected" value={metrics?.totalRejected ?? '-'} tone="danger" />
        <MetricCard label="Conversion Rate" value={metrics ? `${metrics.conversionRate.toFixed(2)}%` : '-'} tone="neutral" />
      </div>

      <p className="dashboard-helper-note">OA means Online Assessment.</p>

      {funnelQuery.data && (
        <SankeyFunnel
          data={funnelQuery.data}
          stageTotals={{
            Applied: metrics?.totalApplied ?? 0,
            OnlineAssessment: metrics?.totalOnlineAssessments ?? 0,
            Interview: metrics?.totalInterviews ?? 0,
            Offer: metrics?.totalOffers ?? 0,
            Rejected: metrics?.totalRejected ?? 0,
          }}
        />
      )}
    </section>
  );
}

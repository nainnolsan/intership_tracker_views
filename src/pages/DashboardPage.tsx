import { useState } from 'react';
import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import { useDashboardMetrics, useFunnelFlow } from '../features/internships/hooks/useInternshipsData';

const DASHBOARD_METRIC_COLORS_STORAGE_KEY = 'dashboardMetricColors';

type MetricKey = 'applied' | 'oa' | 'interviews' | 'offers' | 'rejected' | 'conversion';

const DEFAULT_METRIC_COLORS: Record<MetricKey, string> = {
  applied: '#1e3a8a',
  oa: '#0f766e',
  interviews: '#6d28d9',
  offers: '#166534',
  rejected: '#991b1b',
  conversion: '#9f1239',
};

const readStoredMetricColors = (): Record<MetricKey, string> => {
  if (typeof window === 'undefined') {
    return DEFAULT_METRIC_COLORS;
  }

  const stored = localStorage.getItem(DASHBOARD_METRIC_COLORS_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_METRIC_COLORS;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<Record<MetricKey, string>>;
    return {
      ...DEFAULT_METRIC_COLORS,
      ...parsed,
    };
  } catch {
    return DEFAULT_METRIC_COLORS;
  }
};

export default function DashboardPage() {
  const [metricColors, setMetricColors] = useState<Record<MetricKey, string>>(readStoredMetricColors);
  const metricsQuery = useDashboardMetrics();
  const funnelQuery = useFunnelFlow();

  const metrics = metricsQuery.data;

  const updateMetricColor = (key: MetricKey, value: string) => {
    setMetricColors((previous) => {
      const next = {
        ...previous,
        [key]: value,
      };
      localStorage.setItem(DASHBOARD_METRIC_COLORS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className="view dashboard-view">
      <PageHeader
        title="Dashboard"
        subtitle="Track your internship and job pipeline performance in one place."
      />

      <div className="metric-grid">
        <MetricCard
          label="Total Applied"
          value={metrics?.totalApplied ?? '-'}
          color={metricColors.applied}
          onColorChange={(color) => updateMetricColor('applied', color)}
        />
        <MetricCard
          label="OA"
          value={metrics?.totalOnlineAssessments ?? '-'}
          color={metricColors.oa}
          onColorChange={(color) => updateMetricColor('oa', color)}
        />
        <MetricCard
          label="Interviews"
          value={metrics?.totalInterviews ?? '-'}
          color={metricColors.interviews}
          onColorChange={(color) => updateMetricColor('interviews', color)}
        />
        <MetricCard
          label="Offers"
          value={metrics?.totalOffers ?? '-'}
          color={metricColors.offers}
          onColorChange={(color) => updateMetricColor('offers', color)}
        />
        <MetricCard
          label="Rejected"
          value={metrics?.totalRejected ?? '-'}
          color={metricColors.rejected}
          onColorChange={(color) => updateMetricColor('rejected', color)}
        />
        <MetricCard
          label="Conversion Rate"
          value={metrics ? `${metrics.conversionRate.toFixed(2)}%` : '-'}
          color={metricColors.conversion}
          onColorChange={(color) => updateMetricColor('conversion', color)}
        />
      </div>

      <p className="dashboard-helper-note">OA means Online Assessment.</p>

      {funnelQuery.data && <SankeyFunnel data={funnelQuery.data} />}
    </section>
  );
}

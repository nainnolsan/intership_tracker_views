import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import PipelineColumn from '../features/internships/components/PipelineColumn';
import { useDashboardMetrics, useFunnelFlow, useAnalyticsOverview, usePipelineBoard } from '../features/internships/hooks/useInternshipsData';

const DASHBOARD_METRIC_COLORS_STORAGE_KEY = 'dashboardMetricColors';

type MetricKey = 'applied' | 'oa' | 'interviews' | 'offers' | 'rejected' | 'conversion';

const DEFAULT_METRIC_COLORS: Record<MetricKey, string> = {
  applied: '#1e3a8a',
  oa: '#0f766e',
  interviews: '#6d28d9',
  offers: '#166534',
  rejected: '#991b1b',
  conversion: '#111111',
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
  const analyticsQuery = useAnalyticsOverview();
  const pipelineQuery = usePipelineBoard();

  const metrics = metricsQuery.data;
  const analyticsData = analyticsQuery.data;

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
          color="#111111"
        />
      </div>

      <p className="dashboard-helper-note">OA means Online Assessment.</p>

      {funnelQuery.data && (
        <SankeyFunnel
          data={funnelQuery.data}
          stageColors={{
            applied: metricColors.applied,
            oa: metricColors.oa,
            interview: metricColors.interviews,
            offer: metricColors.offers,
            rejected: metricColors.rejected,
          }}
        />
      )}

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ink)' }}>Analytics</h2>
      <div className="analytics-grid">
        <article className="panel">
          <h2>Daily Activity</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applied" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="interview" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="offer" stroke="var(--chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <h2>Stage Mix</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analyticsData?.stageDistribution ?? []} dataKey="value" nameKey="stage" outerRadius={100} fill="var(--chart-2)" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel-wide">
          <h2>Stage Volume</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData?.stageDistribution ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ink)' }}>Pipeline Board</h2>
      <div className="pipeline-board">
        {(pipelineQuery.data ?? []).map((column) => (
          <PipelineColumn key={column.stage} column={column} />
        ))}
      </div>
    </section>
  );
}

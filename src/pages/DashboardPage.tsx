import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import { useDashboardMetrics, useFunnelFlow } from '../features/internships/hooks/useInternshipsData';

export default function DashboardPage() {
  const metricsQuery = useDashboardMetrics();
  const funnelQuery = useFunnelFlow();

  const metrics = metricsQuery.data;

  return (
    <section className="view">
      <PageHeader
        title="Dashboard"
        subtitle="Track your internship and job pipeline performance in one place."
      />

      <div className="metric-grid">
        <MetricCard label="Total Applied" value={metrics?.totalApplied ?? '-'} />
        <MetricCard label="OA" value={metrics?.totalOnlineAssessments ?? '-'} tone="accent" />
        <MetricCard label="Interviews" value={metrics?.totalInterviews ?? '-'} tone="accent" />
        <MetricCard label="Offers" value={metrics?.totalOffers ?? '-'} tone="success" />
        <MetricCard label="Rejected" value={metrics?.totalRejected ?? '-'} tone="danger" />
        <MetricCard label="Conversion Rate" value={metrics ? `${metrics.conversionRate.toFixed(2)}%` : '-'} tone="neutral" />
      </div>

      {funnelQuery.data && <SankeyFunnel data={funnelQuery.data} />}
    </section>
  );
}

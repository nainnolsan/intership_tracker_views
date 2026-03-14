import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../features/internships/components/PageHeader';
import { useAnalyticsOverview } from '../features/internships/hooks/useInternshipsData';

export default function AnalyticsPage() {
  const analyticsQuery = useAnalyticsOverview();
  const data = analyticsQuery.data;

  return (
    <section className="view">
      <PageHeader title="Analytics" subtitle="Trends and stage distribution to optimize your application strategy." />

      <div className="analytics-grid">
        <article className="panel">
          <h2>Daily Activity</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.daily ?? []}>
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
                <Pie data={data?.stageDistribution ?? []} dataKey="value" nameKey="stage" outerRadius={100} fill="var(--chart-2)" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel-wide">
          <h2>Stage Volume</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.stageDistribution ?? []}>
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
    </section>
  );
}

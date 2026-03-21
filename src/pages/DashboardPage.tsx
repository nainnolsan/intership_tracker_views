import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import PipelineColumn from '../features/internships/components/PipelineColumn';
import { useDashboardMetrics, useFunnelFlow, useAnalyticsOverview, usePipelineBoard } from '../features/internships/hooks/useInternshipsData';
import { getSessionProfile } from '../auth/session';
import type { ApplicationDTO } from '../types/internships';

const DASHBOARD_METRIC_COLORS_STORAGE_KEY = 'dashboardMetricColors';
const STAGE_LAYOUT_STORAGE_KEY = 'dashboardStageLayout';

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

interface StageLayoutItem {
  id: string;
  label: string;
  enabled: boolean;
  isCustom: boolean;
}

const sanitizeStageId = (value: string): string => value.trim().replace(/\s+/g, ' ');

const buildStageLayoutStorageKey = (email?: string): string =>
  `${STAGE_LAYOUT_STORAGE_KEY}:${(email ?? 'anonymous').toLowerCase()}`;

const readStoredStageLayout = (storageKey: string): StageLayoutItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StageLayoutItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStageLayout = (storageKey: string, value: StageLayoutItem[]): void => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

export default function DashboardPage() {
  const sessionProfile = useMemo(() => getSessionProfile(), []);
  const stageLayoutStorageKey = useMemo(
    () => buildStageLayoutStorageKey(sessionProfile.email),
    [sessionProfile.email],
  );

  const [metricColors, setMetricColors] = useState<Record<MetricKey, string>>(readStoredMetricColors);
  const [stageLayout, setStageLayout] = useState<StageLayoutItem[]>(() => readStoredStageLayout(stageLayoutStorageKey));
  const [newStageName, setNewStageName] = useState('');

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

  useEffect(() => {
    const columns = pipelineQuery.data ?? [];
    if (columns.length === 0) {
      return;
    }

    setStageLayout((previous) => {
      const base = previous.length > 0
        ? [...previous]
        : columns.map((column) => ({
            id: column.stage,
            label: column.stage,
            enabled: true,
            isCustom: false,
          }));

      const knownIds = new Set(base.map((item) => item.id));
      for (const column of columns) {
        if (!knownIds.has(column.stage)) {
          base.push({
            id: column.stage,
            label: column.stage,
            enabled: true,
            isCustom: false,
          });
        }
      }

      writeStageLayout(stageLayoutStorageKey, base);
      return base;
    });
  }, [pipelineQuery.data, stageLayoutStorageKey]);

  const updateStageLayout = (next: StageLayoutItem[]) => {
    setStageLayout(next);
    writeStageLayout(stageLayoutStorageKey, next);
  };

  const toggleStage = (id: string) => {
    const current = stageLayout.find((item) => item.id === id);
    if (!current) {
      return;
    }

    const actionLabel = current.enabled ? 'hide' : 'show';
    if (!window.confirm(`Are you sure you want to ${actionLabel} stage "${current.label}"?`)) {
      return;
    }

    updateStageLayout(
      stageLayout.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const moveStage = (id: string, direction: -1 | 1) => {
    const fromIndex = stageLayout.findIndex((item) => item.id === id);
    if (fromIndex < 0) {
      return;
    }

    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= stageLayout.length) {
      return;
    }

    const moved = stageLayout[fromIndex];
    if (!window.confirm(`Are you sure you want to move "${moved.label}" ${direction < 0 ? 'up' : 'down'}?`)) {
      return;
    }

    const next = [...stageLayout];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    updateStageLayout(next);
  };

  const removeStage = (id: string) => {
    const current = stageLayout.find((item) => item.id === id);
    if (!current) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete stage "${current.label}" from your board layout?`)) {
      return;
    }

    updateStageLayout(stageLayout.filter((item) => item.id !== id));
  };

  const addStage = () => {
    const trimmed = sanitizeStageId(newStageName);
    if (!trimmed) {
      return;
    }

    if (stageLayout.some((item) => item.id.toLowerCase() === trimmed.toLowerCase())) {
      window.alert('Stage already exists in your layout.');
      return;
    }

    if (!window.confirm(`Are you sure you want to add stage "${trimmed}"?`)) {
      return;
    }

    const next = [
      ...stageLayout,
      {
        id: trimmed,
        label: trimmed,
        enabled: true,
        isCustom: true,
      },
    ];
    updateStageLayout(next);
    setNewStageName('');
  };

  const pipelineColumns = useMemo(() => {
    const columns = pipelineQuery.data ?? [];
    const byStage = new Map<string, (typeof columns)[number]>(columns.map((column) => [column.stage, column]));

    const layout = stageLayout.length > 0
      ? stageLayout
      : columns.map((column) => ({
          id: column.stage,
          label: column.stage,
          enabled: true,
          isCustom: false,
        }));

    return layout
      .filter((item) => item.enabled)
      .map((item) => {
        const existing = byStage.get(item.id);
        if (existing) {
          return {
            stage: existing.stage,
            label: item.label,
            total: existing.total,
            applications: existing.applications,
          };
        }

        return {
          stage: item.id,
          label: item.label,
          total: 0,
          applications: [] as ApplicationDTO[],
        };
      });
  }, [pipelineQuery.data, stageLayout]);

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
          transparent
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
                <Line type="monotone" dataKey="applied" stroke={metricColors.applied} strokeWidth={2} />
                <Line type="monotone" dataKey="interview" stroke={metricColors.interviews} strokeWidth={2} />
                <Line type="monotone" dataKey="offer" stroke={metricColors.offers} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <h2>Stage Mix</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.stageDistribution?.map((item: { stage: string; value: number }) => ({
                    ...item,
                    fill:
                      item.stage === 'Rejected'
                        ? metricColors.rejected
                        : item.stage === 'Offer'
                          ? metricColors.offers
                          : item.stage === 'Interview'
                            ? metricColors.interviews
                            : item.stage === 'OnlineAssessment'
                              ? metricColors.oa
                              : metricColors.applied,
                  })) ?? []
                }
                  dataKey="value"
                  nameKey="stage"
                  outerRadius={100}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel-wide">
          <h2>Stage Volume</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={analyticsData?.stageDistribution?.map((item: { stage: string; value: number }) => ({
                  ...item,
                  fill:
                    item.stage === 'Rejected'
                      ? metricColors.rejected
                      : item.stage === 'Offer'
                        ? metricColors.offers
                        : item.stage === 'Interview'
                          ? metricColors.interviews
                          : item.stage === 'OnlineAssessment'
                            ? metricColors.oa
                            : metricColors.applied,
                })) ?? []
              }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={metricColors.applied} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ink)' }}>Pipeline Board</h2>
      <div className="stage-manager">
        <h3>Stage Settings</h3>
        <p>Add, hide, delete, and reorder stages for your own board layout.</p>

        <div className="stage-manager-list">
          {stageLayout.map((item, index) => (
            <div key={item.id} className="stage-manager-row">
              <div>
                <strong>{item.label}</strong>
                <small>{item.enabled ? 'Visible' : 'Hidden'}</small>
              </div>

              <div className="stage-manager-actions">
                <button type="button" onClick={() => moveStage(item.id, -1)} disabled={index === 0} aria-label={`Move ${item.label} up`}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStage(item.id, 1)}
                  disabled={index === stageLayout.length - 1}
                  aria-label={`Move ${item.label} down`}
                >
                  ↓
                </button>
                <button type="button" onClick={() => toggleStage(item.id)} aria-label={`Toggle ${item.label}`}>
                  {item.enabled ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={() => removeStage(item.id)} aria-label={`Delete ${item.label}`}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="stage-manager-add">
          <input
            type="text"
            value={newStageName}
            onChange={(event) => setNewStageName(event.target.value)}
            placeholder="New stage name"
          />
          <button type="button" className="btn" onClick={addStage}>Add Stage</button>
        </div>
      </div>

      <div className="pipeline-board">
        {pipelineColumns.map((column) => (
          <PipelineColumn key={column.stage} column={column} label={column.label} />
        ))}
      </div>
    </section>
  );
}

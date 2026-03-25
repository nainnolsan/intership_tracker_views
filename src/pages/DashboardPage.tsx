import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MetricCard from '../features/internships/components/MetricCard';
import PageHeader from '../features/internships/components/PageHeader';
import SankeyFunnel from '../features/internships/components/SankeyFunnel';
import PipelineColumn from '../features/internships/components/PipelineColumn';
import { useDashboardMetrics, useFunnelFlow, useAnalyticsOverview, usePipelineBoard, useSaveStageLayout, useStageLayout } from '../features/internships/hooks/useInternshipsData';
import type { ApplicationDTO, SaveStageLayoutItemDTO } from '../types/internships';

const DASHBOARD_METRIC_COLORS_STORAGE_KEY = 'dashboardMetricColors';

type MetricKey = string;

const DEFAULT_METRIC_COLORS: Record<string, string> = {
  Applied: '#1e3a8a',
  OnlineAssessment: '#0f766e',
  Interview: '#6d28d9',
  Offer: '#166534',
  Rejected: '#991b1b',
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
    const result = { ...DEFAULT_METRIC_COLORS };
    for (const [k, v] of Object.entries(parsed)) {
      if (v) result[k] = v;
    }
    return result;
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

function SortableMetricWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [metricColors, setMetricColors] = useState<Record<MetricKey, string | undefined>>(readStoredMetricColors);
  const [stageLayout, setStageLayout] = useState<StageLayoutItem[]>([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStageLayout((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        void persistStageLayout(newItems);
        return newItems;
      });
    }
  };

  const renameStage = (id: string, newLabel: string) => {
    void persistStageLayout(
      stageLayout.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const metricsQuery = useDashboardMetrics();
  const funnelQuery = useFunnelFlow();
  const analyticsQuery = useAnalyticsOverview();
  const pipelineQuery = usePipelineBoard();
  const stageLayoutQuery = useStageLayout();
  const saveStageLayoutMutation = useSaveStageLayout();

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

  const persistStageLayout = async (next: StageLayoutItem[]) => {
    setStageLayout(next);

    const payload: SaveStageLayoutItemDTO[] = next.map((item) => ({
      id: item.id,
      label: item.label,
      enabled: item.enabled,
      isCustom: item.isCustom,
    }));

    try {
      await saveStageLayoutMutation.mutateAsync(payload);
    } catch {
      // Keep optimistic state; next successful save will sync backend.
    }
  };

  useEffect(() => {
    const columns = pipelineQuery.data ?? [];
    if (columns.length === 0) {
      return;
    }

    const fromServer = stageLayoutQuery.data;
    const base = (fromServer && fromServer.length > 0)
      ? [...fromServer]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            id: item.id,
            label: item.label,
            enabled: item.enabled,
            isCustom: item.isCustom,
          }))
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

    setStageLayout(base);

    if (!fromServer || fromServer.length === 0) {
      void persistStageLayout(base);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineQuery.data, stageLayoutQuery.data]);

  // toggleStage removed since stages are controlled directly

  // moveStage removed in favor of drag and drop

  const removeStage = (id: string) => {
    const current = stageLayout.find((item) => item.id === id);
    if (!current) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete stage "${current.label}" from your board layout?`)) {
      return;
    }

    void persistStageLayout(stageLayout.filter((item) => item.id !== id));
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
    void persistStageLayout(next);
    setNewStageName('');
    setIsAddingStage(false);
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
      {saveStageLayoutMutation.loading && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div style={{ width: '3.5rem', height: '3.5rem', border: '0.3em solid color-mix(in srgb, var(--paper) 30%, transparent)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spinner-border .7s linear infinite' }} role="status">
            <span className="visually-hidden" style={{ opacity: 0 }}>Loading...</span>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }
      `}} />
      <PageHeader
        title="Dashboard"
        subtitle="Track your internship and job pipeline performance in one place."
      />

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
        <MetricCard
          label="Total Applied"
          value={metrics?.totalApplied ?? '-'}
          color="#1e3a8a"
          transparent={true}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pipelineColumns.map((c) => c.stage)}
            strategy={horizontalListSortingStrategy}
          >
            {pipelineColumns.map((column) => (
              <SortableMetricWrapper key={column.stage} id={column.stage}>
                <MetricCard
                  label={column.label}
                  value={column.total}
                  color={metricColors[column.stage] ?? metricColors[column.stage.toLowerCase()] ?? '#6451a8'}
                  onColorChange={(color) => updateMetricColor(column.stage, color)}
                  onRename={(newName) => renameStage(column.stage, newName)}
                  onDelete={() => removeStage(column.stage)}
                />
              </SortableMetricWrapper>
            ))}
          </SortableContext>
        </DndContext>

        {isAddingStage ? (
          <article className="metric-card metric-card-solid new-stage-card" style={{ '--metric-solid-bg': 'transparent', '--metric-solid-ink': 'var(--ink)', border: '1px dashed var(--line-strong)' } as React.CSSProperties}>
            <input
              autoFocus
              className="inline-edit-input"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="New stage..."
              style={{ background: 'var(--paper)', fontSize: '0.9rem', width: '100%', marginBottom: '10px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addStage();
                if (e.key === 'Escape') setIsAddingStage(false);
              }}
              onBlur={() => {
                if(newStageName.trim() !== '') addStage();
                else setIsAddingStage(false);
              }}
            />
          </article>
        ) : (
          <button 
            type="button" 
            className="metric-card add-metric-btn" 
            onClick={() => setIsAddingStage(true)}
            style={{ 
              background: 'transparent', 
              border: '1px dashed var(--line)', 
              color: 'var(--muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'all 0.2s',
              fontWeight: 500
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
             + Add Stage
          </button>
        )}

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
          stageOrder={pipelineColumns.map((c) => c.stage)}
          stageColors={{
            applied: metricColors['Applied'] ?? '#1e3a8a',
            oa: metricColors['OnlineAssessment'] ?? '#0f766e',
            interview: metricColors['Interview'] ?? '#6d28d9',
            offer: metricColors['Offer'] ?? '#166534',
            rejected: metricColors['Rejected'] ?? '#991b1b',
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
                <Line type="monotone" dataKey="applied" stroke={metricColors['Applied'] ?? '#1e3a8a'} strokeWidth={2} />
                <Line type="monotone" dataKey="interview" stroke={metricColors['Interview'] ?? '#6d28d9'} strokeWidth={2} />
                <Line type="monotone" dataKey="offer" stroke={metricColors['Offer'] ?? '#166534'} strokeWidth={2} />
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
                    fill: metricColors[item.stage] ?? '#cbd5e1',
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
                  fill: metricColors[item.stage] ?? '#cbd5e1',
                })) ?? []
              }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={metricColors['Applied'] ?? '#1e3a8a'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ink)' }}>Pipeline Board</h2>
      {/* Old stage manager list removed */}

      <div className="pipeline-board">
        {pipelineColumns.map((column) => (
          <PipelineColumn key={column.stage} column={column} label={column.label} />
        ))}
      </div>
    </section>
  );
}

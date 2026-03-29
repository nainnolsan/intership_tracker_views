import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, Cell } from 'recharts';
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
import AddStageModal from '../features/internships/components/AddStageModal';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleAddStageModalSave = (newName: string, color: string, insertAfterId: string | null) => {
    const trimmed = sanitizeStageId(newName);
    if (!trimmed) return;

    if (stageLayout.some((item) => item.id.toLowerCase() === trimmed.toLowerCase())) {
      window.alert('Stage already exists in your layout.');
      return;
    }

    const newStageItem = {
      id: trimmed,
      label: trimmed,
      enabled: true,
      isCustom: true,
    };

    const nextLayout = [...stageLayout];
    if (insertAfterId === null) {
      nextLayout.unshift(newStageItem);
    } else {
      const idx = nextLayout.findIndex(i => i.id === insertAfterId);
      if (idx !== -1) {
         nextLayout.splice(idx + 1, 0, newStageItem);
      } else {
         nextLayout.push(newStageItem);
      }
    }

    void persistStageLayout(nextLayout);
    updateMetricColor(trimmed, color);
    setIsAddModalOpen(false);
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
      .filter((item) => item.id.toLowerCase() !== 'applied' && item.label.toLowerCase() !== 'applied')
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

        <button 
          type="button" 
          className="metric-card add-metric-btn" 
          onClick={() => setIsAddModalOpen(true)}
          style={{ 
            background: 'color-mix(in srgb, var(--paper) 60%, transparent)', 
            border: '1px solid var(--line)', 
            color: 'var(--muted)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            fontWeight: 300,
            lineHeight: 0,
            transition: 'all 0.2s ease',
            minHeight: '100px'
          }}
          onMouseOver={(e) => { 
            e.currentTarget.style.borderColor = 'var(--line-strong)'; 
            e.currentTarget.style.color = 'var(--ink)'; 
            e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-soft) 40%, transparent)'; 
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.borderColor = 'var(--line)'; 
            e.currentTarget.style.color = 'var(--muted)'; 
            e.currentTarget.style.background = 'color-mix(in srgb, var(--paper) 60%, transparent)'; 
          }}
        >
           +
        </button>

        <AddStageModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddStageModalSave}
          stageLayout={pipelineColumns.map(c => ({ id: c.stage, label: c.label }))}
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
              <AreaChart data={analyticsData?.daily ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors['Applied'] ?? '#1e3a8a'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricColors['Applied'] ?? '#1e3a8a'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors['Interview'] ?? '#6d28d9'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricColors['Interview'] ?? '#6d28d9'} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOffer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors['Offer'] ?? '#166534'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricColors['Offer'] ?? '#166534'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', color: 'var(--ink)' }} 
                  itemStyle={{ color: 'var(--ink)' }}
                />
                <Area type="monotone" dataKey="applied" stroke={metricColors['Applied'] ?? '#1e3a8a'} fillOpacity={1} fill="url(#colorApplied)" strokeWidth={3} />
                <Area type="monotone" dataKey="interview" stroke={metricColors['Interview'] ?? '#6d28d9'} fillOpacity={1} fill="url(#colorInterview)" strokeWidth={3} />
                <Area type="monotone" dataKey="offer" stroke={metricColors['Offer'] ?? '#166534'} fillOpacity={1} fill="url(#colorOffer)" strokeWidth={3} />
              </AreaChart>
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
                  })) ?? []}
                  dataKey="value"
                  nameKey="stage"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={6}
                  cornerRadius={8}
                  stroke="none"
                >
                  {(analyticsData?.stageDistribution ?? []).map((entry: { stage: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={metricColors[entry.stage] ?? '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', color: 'var(--ink)' }} 
                  itemStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel-wide">
          <h2>Stage Volume</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={analyticsData?.stageDistribution ?? []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="stage" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', color: 'var(--ink)' }} 
                  cursor={{ fill: 'color-mix(in srgb, var(--ink) 5%, transparent)', radius: 8 }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} maxBarSize={45}>
                  {(analyticsData?.stageDistribution ?? []).map((entry: { stage: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={metricColors[entry.stage] ?? '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ink)' }}>Pipeline Tracker</h2>
      
      <div className="pipeline-tracker-list" style={{ display: 'grid', gap: '0.8rem', paddingBottom: '3rem' }}>
        {pipelineColumns.flatMap(c => c.applications).sort((a,b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).map(application => {
          const currentIndex = pipelineColumns.findIndex(c => c.stage === application.stage);
          
          return (
            <article key={application.id} className="pipeline-tracker-row" style={{ display: 'flex', alignItems: 'center', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '16px', padding: '1.2rem 1.5rem', gap: '2.5rem', boxShadow: 'var(--shadow)' }}>
              
              <div style={{ flex: '0 0 250px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--ink)', fontWeight: 700 }}>{application.company}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>{application.roleTitle}</p>
                <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--muted)', fontSize: '0.75rem', opacity: 0.8 }}>
                  Applied: {new Date(application.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </small>
              </div>

              <div className="pipeline-stepper" style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', padding: '0 1rem', paddingBottom: '1.2rem' }}>
                {pipelineColumns.map((col, index) => {
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const color = metricColors[col.stage] ?? '#cbd5e1';
                  
                  return (
                    <div key={col.stage} style={{ display: 'flex', alignItems: 'center', flex: index === pipelineColumns.length - 1 ? 0 : 1 }}>
                      
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: isCurrent ? '22px' : '16px',
                          height: isCurrent ? '22px' : '16px',
                          borderRadius: '50%',
                          background: isCompleted || isCurrent ? color : 'var(--line)',
                          border: isCurrent ? `4px solid color-mix(in srgb, ${color} 30%, var(--paper))` : '2px solid var(--paper)',
                          zIndex: 2,
                          boxShadow: isCurrent ? `0 0 0 4px color-mix(in srgb, ${color} 20%, transparent)` : 'none',
                          transition: 'all 0.3s ease'
                        }} title={col.label} />
                        
                        <span style={{ 
                          position: 'absolute', top: '100%', marginTop: '0.8rem',
                          fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500,
                          color: isCompleted || isCurrent ? 'var(--ink)' : 'var(--muted)',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease'
                        }}>
                          {col.label}
                        </span>
                      </div>

                      {index < pipelineColumns.length - 1 && (
                         <div style={{ 
                           flex: 1, height: '4px',
                           background: isCompleted ? color : 'var(--line)',
                           marginLeft: '-4px', marginRight: '-4px', zIndex: 1,
                           opacity: isCompleted ? 0.8 : 0.3,
                           transition: 'all 0.3s ease'
                         }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
        {pipelineColumns.flatMap(c => c.applications).length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--paper)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
            <p>No applications found. Add one to see the journey tracker.</p>
          </div>
        )}
      </div>
    </section>
  );
}

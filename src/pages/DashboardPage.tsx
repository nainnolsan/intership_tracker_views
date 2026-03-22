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
  verticalListSortingStrategy,
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

function SortableStageItem({
  item,
  onToggle,
  onRemove,
  onRename
}: {
  item: StageLayoutItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newLabel: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? ('relative' as const) : undefined,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);

  const handleRename = () => {
    if (editValue.trim() && editValue.trim() !== item.label) {
      onRename(item.id, editValue.trim());
    } else {
      setEditValue(item.label);
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className={`stage-manager-row ${isDragging ? 'dragging' : ''}`}>
      <button type="button" className="drag-handle" {...attributes} {...listeners} aria-label="Drag handle">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </button>

      <div className="stage-manager-row-content">
        {isEditing ? (
          <input
            autoFocus
            className="inline-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditValue(item.label);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <div className="stage-label-group" onDoubleClick={() => setIsEditing(true)}>
            <strong>{item.label}</strong>
            <button type="button" className="edit-icon-btn" onClick={() => setIsEditing(true)} aria-label="Edit name">
              ✎
            </button>
            <small>{item.enabled ? 'Visible' : 'Hidden'}</small>
          </div>
        )}
      </div>

      <div className="stage-manager-actions">
        <button type="button" onClick={() => onToggle(item.id)} aria-label={`Toggle ${item.label}`}>
          {item.enabled ? 'Hide' : 'Show'}
        </button>
        <button type="button" onClick={() => onRemove(item.id)} aria-label={`Delete ${item.label}`} className="danger-btn">
          Del
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [metricColors, setMetricColors] = useState<Record<MetricKey, string>>(readStoredMetricColors);
  const [stageLayout, setStageLayout] = useState<StageLayoutItem[]>([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
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
  }, [pipelineQuery.data, stageLayoutQuery.data]);

  const toggleStage = (id: string) => {
    const current = stageLayout.find((item) => item.id === id);
    if (!current) {
      return;
    }

    const actionLabel = current.enabled ? 'hide' : 'show';
    if (!window.confirm(`Are you sure you want to ${actionLabel} stage "${current.label}"?`)) {
      return;
    }

    void persistStageLayout(
      stageLayout.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="stage-manager-list">
            <SortableContext
              items={stageLayout.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {stageLayout.map((item) => (
                <SortableStageItem 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleStage} 
                  onRemove={removeStage} 
                  onRename={renameStage}
                />
              ))}
            </SortableContext>

            {isAddingStage ? (
              <div className="stage-manager-row inline-add-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                <div style={{ width: '25px' }}></div>
                <div className="stage-manager-row-content">
                  <input
                    autoFocus
                    className="inline-edit-input"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Type new stage name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addStage();
                      if (e.key === 'Escape') setIsAddingStage(false);
                    }}
                    onBlur={() => {
                      if(newStageName.trim() !== '') addStage();
                      else setIsAddingStage(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                className="add-stage-trigger-btn" 
                onClick={() => setIsAddingStage(true)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Add another stage
              </button>
            )}
          </div>
        </DndContext>
      </div>

      <div className="pipeline-board">
        {pipelineColumns.map((column) => (
          <PipelineColumn key={column.stage} column={column} label={column.label} />
        ))}
      </div>
    </section>
  );
}

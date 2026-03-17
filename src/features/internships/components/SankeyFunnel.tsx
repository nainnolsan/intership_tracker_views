import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { FunnelFlowDTO } from '../../../types/internships';

interface StageTotals {
  Applied: number;
  OnlineAssessment: number;
  Interview: number;
  Offer: number;
  Rejected: number;
}

interface SankeyFunnelProps {
  data: FunnelFlowDTO;
  stageTotals: StageTotals;
}

const toReadableStageName = (name: string): string => {
  const normalized = name.trim().toLowerCase();

  if (normalized === 'oa' || normalized === 'onlineassessment' || normalized === 'online_assessment') {
    return 'OnlineAssessment';
  }

  if (normalized === 'applied') return 'Applied';
  if (normalized === 'interview') return 'Interview';
  if (normalized === 'offer') return 'Offer';
  if (normalized === 'rejected') return 'Rejected';

  return name;
};

export default function SankeyFunnel({ data, stageTotals }: SankeyFunnelProps) {
  const hasLinks = data.links.some((link) => link.value > 0);
  const normalizedData: FunnelFlowDTO = {
    ...data,
    nodes: data.nodes.map((node) => ({ name: toReadableStageName(node.name) })),
  };

  const fallbackStages = [
    { key: 'Applied', label: 'Applied', value: stageTotals.Applied },
    { key: 'OnlineAssessment', label: 'OA', value: stageTotals.OnlineAssessment },
    { key: 'Interview', label: 'Interview', value: stageTotals.Interview },
    { key: 'Offer', label: 'Offer', value: stageTotals.Offer },
    { key: 'Rejected', label: 'Rejected', value: stageTotals.Rejected },
  ];

  const hasAnyProgress = fallbackStages.some((stage) => stage.value > 0);
  const maxStageValue = Math.max(...fallbackStages.map((s) => s.value), 1);

  return (
    <div className="panel card-sankey">
      <h2>Funnel Flow</h2>
      <p className="panel-description">Applied to OA to Interview to Offer/Rejected</p>
      <div className="sankey-wrapper">
        {hasLinks ? (
          <ResponsiveContainer width="100%" height={340}>
            <Sankey
              data={normalizedData}
              nodePadding={40}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              link={{ stroke: 'var(--dashboard-accent, var(--chart-2))' }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <div className="funnel-flow-fallback">
            <svg width="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet" className="funnel-svg">
              {fallbackStages.map((stage, index) => {
                const hasValue = stage.value > 0;
                const widthPercent = hasValue ? (stage.value / maxStageValue) * 95 : 0;
                const yOffset = index * 60 + 20;
                const centerX = 300;
                const leftX = centerX - (widthPercent * 3);
                const rightX = centerX + (widthPercent * 3);

                return (
                  <g key={stage.key}>
                    {/* Funnel segment */}
                    {hasValue && (
                      <>
                        <polygon
                          points={`${leftX},${yOffset} ${rightX},${yOffset} ${centerX + (widthPercent * 2.5)},${yOffset + 50} ${centerX - (widthPercent * 2.5)},${yOffset + 50}`}
                          fill={`var(--dashboard-accent, var(--chart-${index + 1}))`}
                          opacity="0.15"
                          stroke={`var(--dashboard-accent, var(--chart-${index + 1}))`}
                          strokeWidth="2"
                        />
                        {/* Stage label */}
                        <text
                          x={centerX}
                          y={yOffset + 28}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="funnel-stage-text"
                        >
                          {stage.label}
                        </text>
                        {/* Stage value */}
                        <text
                          x={centerX}
                          y={yOffset + 40}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="funnel-stage-value"
                        >
                          {stage.value}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
            <p className="funnel-fallback-note">
              {hasAnyProgress
                ? 'Funnel showing current stage distribution. More stages will appear as applications progress.'
                : 'Your funnel will appear here as applications move through stages.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

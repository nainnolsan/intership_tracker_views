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

  const lastReachedIndex = Math.max(
    0,
    fallbackStages.reduce((last, stage, index) => (stage.value > 0 ? index : last), -1),
  );
  const hasAnyProgress = fallbackStages.some((stage) => stage.value > 0);
  const reachedSegments = hasAnyProgress ? Math.max(1, lastReachedIndex) : 0;

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
          <div className="funnel-stage-fallback">
            <div className="funnel-progress-track" aria-hidden="true">
              {fallbackStages.map((stage, index) => (
                <div key={`progress-${stage.key}`} className="funnel-progress-part">
                  <span className={`funnel-progress-node ${index <= lastReachedIndex ? 'reached' : 'future'}`} />
                  {index < fallbackStages.length - 1 && (
                    <span
                      className={`funnel-progress-segment ${index < reachedSegments ? 'reached' : 'future'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {fallbackStages.map((stage, index) => (
              <div key={stage.key} className="funnel-stage-item">
                <strong>{stage.label}</strong>
                <span>{stage.value}</span>
                {index < fallbackStages.length - 1 && <i aria-hidden="true">-&gt;</i>}
              </div>
            ))}
            <p className="funnel-fallback-note">
              Solid segments show current visible progress. Dotted segments show the next stages you can reach.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

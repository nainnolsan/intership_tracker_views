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
  const normalizedData: FunnelFlowDTO = {
    ...data,
    nodes: data.nodes.map((node) => ({ name: toReadableStageName(node.name) })),
  };

  // If no real links exist, create implicit links based on stageTotals
  let mergedData = normalizedData;
  if (normalizedData.links.length === 0 || normalizedData.links.every((link) => link.value === 0)) {
    const stages = [
      { nodeIndex: 0, label: 'Applied', count: stageTotals.Applied },
      { nodeIndex: 1, label: 'OnlineAssessment', count: stageTotals.OnlineAssessment },
      { nodeIndex: 2, label: 'Interview', count: stageTotals.Interview },
      { nodeIndex: 3, label: 'Offer', count: stageTotals.Offer },
      { nodeIndex: 4, label: 'Rejected', count: stageTotals.Rejected },
    ];

    // Create implicit flows: if Applied has 5 and OA has 2, create a link Applied->OA with value 2
    const implicitLinks = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const currentCount = stages[i].count;
      if (currentCount > 0) {
        // Flow some to next stage if next stage has items
        const nextCount = stages[i + 1].count;
        const flowValue = Math.min(currentCount, nextCount > 0 ? nextCount : currentCount * 0.3);
        if (flowValue > 0) {
          implicitLinks.push({ source: i, target: i + 1, value: flowValue });
        }
      }
    }

    mergedData = {
      ...normalizedData,
      links: implicitLinks.length > 0 ? implicitLinks : normalizedData.links,
    };
  }

  return (
    <div className="panel card-sankey">
      <h2>Funnel Flow</h2>
      <p className="panel-description">Applied to OA to Interview to Offer/Rejected</p>
      <div className="sankey-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <Sankey
            data={mergedData}
            nodePadding={40}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ stroke: 'var(--dashboard-accent, var(--chart-2))' }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

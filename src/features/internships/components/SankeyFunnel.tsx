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

export default function SankeyFunnel({ data, stageTotals }: SankeyFunnelProps) {
  // Build a Sankey with a "Total" source node that distributes to each stage
  const stages = [
    { label: 'Applied', count: stageTotals.Applied },
    { label: 'OnlineAssessment', count: stageTotals.OnlineAssessment },
    { label: 'Interview', count: stageTotals.Interview },
    { label: 'Offer', count: stageTotals.Offer },
    { label: 'Rejected', count: stageTotals.Rejected },
  ];

  // Create nodes: [Total, Applied, OA, Interview, Offer, Rejected]
  const sankeyNodes = [{ name: 'Total Applications' }, ...stages.map((s) => ({ name: s.label }))];

  // Create links from Total to each stage (only if count > 0)
  const sankeyLinks = stages
    .map((stage, index) => ({
      source: 0, // Total node
      target: index + 1, // Stage node
      value: stage.count > 0 ? stage.count : 0.1, // Min 0.1 for visibility if count is 0
    }))
    .filter((link) => link.value > 0);

  // If we have real links from the data, use those in addition
  const mergedLinks = [...sankeyLinks];
  if (data.links.some((link) => link.value > 0)) {
    // Adjust source/target indices to account for new Total node
    data.links.forEach((link) => {
      if (link.value > 0) {
        mergedLinks.push({
          source: link.source + 1,
          target: link.target + 1,
          value: link.value,
        });
      }
    });
  }

  const sankeyData = {
    nodes: sankeyNodes,
    links: mergedLinks,
  };

  return (
    <div className="panel card-sankey">
      <h2>Funnel Flow</h2>
      <p className="panel-description">Applied to OA to Interview to Offer/Rejected</p>
      <div className="sankey-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <Sankey
            data={sankeyData}
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

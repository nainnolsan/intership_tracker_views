import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { FunnelFlowDTO } from '../../../types/internships';

interface SankeyFunnelProps {
  data: FunnelFlowDTO;
}

export default function SankeyFunnel({ data }: SankeyFunnelProps) {
  const hasLinks = data.links.some((link) => link.value > 0);

  const anchoredData: FunnelFlowDTO = {
    nodes: data.nodes,
    links: [
      ...data.links,
      // Anchor links keep early rejected nodes in their own stage columns.
      { source: 4, target: 2, value: 0 },
      { source: 5, target: 3, value: 0 },
      { source: 6, target: 3, value: 0 },
    ].filter(
      (link) =>
        link.source < data.nodes.length &&
        link.target < data.nodes.length,
    ),
  };

  return (
    <div className="panel card-sankey">
      <h2>Pipeline Flow</h2>
      <p className="panel-description">All Applications to OA/Rejected and progress through each stage.</p>
      <div className="sankey-wrapper">
        {hasLinks ? (
          <ResponsiveContainer width="100%" height={340}>
            <Sankey
              data={anchoredData}
              nodePadding={34}
              nodeWidth={12}
              linkCurvature={0.56}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              link={{ stroke: 'var(--dashboard-accent, var(--chart-2))' }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <p className="funnel-fallback-note">No pipeline transitions yet. Start updating stages to see flow branches.</p>
        )}
      </div>
    </div>
  );
}

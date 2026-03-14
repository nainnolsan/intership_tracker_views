import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { FunnelFlowDTO } from '../../../types/internships';

interface SankeyFunnelProps {
  data: FunnelFlowDTO;
}

export default function SankeyFunnel({ data }: SankeyFunnelProps) {
  return (
    <div className="panel card-sankey">
      <h2>Funnel Flow</h2>
      <p className="panel-description">Applied to OA to Interview to Offer/Rejected</p>
      <div className="sankey-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <Sankey
            data={data}
            nodePadding={40}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ stroke: 'var(--chart-2)' }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

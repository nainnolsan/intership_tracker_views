import { Rectangle, ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { FunnelFlowDTO } from '../../../types/internships';

interface SankeyFunnelProps {
  data: FunnelFlowDTO;
}

interface SankeyNodeShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: {
    name?: string;
    payload?: { name?: string };
    node?: { name?: string };
  };
}

function pickNodeColor(nodeName?: string, index = 0): string {
  const name = (nodeName ?? '').toLowerCase();

  if (name.includes('onlineassessment')) return '#22c55e'; // green
  if (name.includes('interview') && !name.includes('rejected')) return '#f59e0b'; // orange
  if (name.includes('offer')) return '#a855f7'; // purple (final)
  if (name.includes('rejected/ghosted')) return '#ef4444'; // red (aligned with OA)
  if (name.includes('rejected in oa')) return '#14b8a6'; // aqua (aligned with Interview)
  if (name.includes('rejected in interview')) return '#fb7185';
  if (name.includes('applied')) return '#0ea5e9';

  const fallback = ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#fb7185'];
  return fallback[index % fallback.length];
}

function SankeyNodeShape({ x = 0, y = 0, width = 0, height = 0, index = 0, payload }: SankeyNodeShapeProps) {
  const nodeName = payload?.name ?? payload?.payload?.name ?? payload?.node?.name;
  const fill = pickNodeColor(nodeName, index);

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={1}
    />
  );
}

export default function SankeyFunnel({ data }: SankeyFunnelProps) {
  const hasLinks = data.links.some((link) => link.value > 0);

  return (
    <div className="panel card-sankey">
      <h2>Pipeline Flow</h2>
      <p className="panel-description">All Applications to OA/Rejected and progress through each stage.</p>
      <div className="sankey-wrapper">
        {hasLinks ? (
          <ResponsiveContainer width="100%" height={340}>
            <Sankey
              data={data}
              nodePadding={34}
              nodeWidth={12}
              linkCurvature={0.56}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              node={<SankeyNodeShape />}
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

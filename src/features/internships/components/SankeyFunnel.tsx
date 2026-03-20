import { Rectangle, ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { FunnelFlowDTO } from '../../../types/internships';

interface SankeyFunnelProps {
  data: FunnelFlowDTO;
  stageColors: {
    applied: string;
    oa: string;
    interview: string;
    offer: string;
    rejected: string;
  };
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
  stageColors?: SankeyFunnelProps['stageColors'];
}

function pickNodeColor(
  nodeName: string | undefined,
  stageColors: SankeyFunnelProps['stageColors'],
  index = 0,
): string {
  const name = (nodeName ?? '').toLowerCase();

  if (name.includes('onlineassessment')) return stageColors.oa;
  if (name.includes('interview') && !name.includes('rejected')) return stageColors.interview;
  if (name.includes('offer')) return stageColors.offer;
  if (name.includes('rejected')) return stageColors.rejected;
  if (name.includes('applied')) return stageColors.applied;

  const fallback = [
    stageColors.applied,
    stageColors.oa,
    stageColors.interview,
    stageColors.offer,
    stageColors.rejected,
  ];
  return fallback[index % fallback.length];
}

interface SankeyLinkShapeProps {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  sourceRelativeY?: number;
  targetRelativeY?: number;
  linkWidth: number;
  payload: {
    source: { name?: string };
    target: { name?: string };
  };
  stageColors: SankeyFunnelProps['stageColors'];
}

function getLinkCenterY(baseY: number, relativeY: number | undefined, linkWidth: number): number {
  return baseY + (relativeY ?? 0) + linkWidth / 2;
}

function buildSankeyPath(
  sourceX: number,
  targetX: number,
  sourceControlX: number,
  targetControlX: number,
  y0: number,
  y1: number,
): string {
  return `M${sourceX},${y0} C${sourceControlX},${y0} ${targetControlX},${y1} ${targetX},${y1}`;
}

function SankeyNodeShape({ x = 0, y = 0, width = 0, height = 0, index = 0, payload, stageColors }: SankeyNodeShapeProps) {
  const nodeName = payload?.name ?? payload?.payload?.name ?? payload?.node?.name;
  const palette = stageColors ?? {
    applied: '#1e3a8a',
    oa: '#0f766e',
    interview: '#6d28d9',
    offer: '#166534',
    rejected: '#991b1b',
  };
  const fill = pickNodeColor(nodeName, palette, index);

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

function SankeyLinkShape({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  sourceRelativeY,
  targetRelativeY,
  linkWidth,
  payload,
  stageColors,
}: SankeyLinkShapeProps) {
  // Match Recharts default geometry: base column Y + per-link offset + half band width.
  const y0 = getLinkCenterY(sourceY, sourceRelativeY, linkWidth);
  const y1 = getLinkCenterY(targetY, targetRelativeY, linkWidth);
  const targetName = payload?.target?.name;
  const sourceName = payload?.source?.name;

  // Color links by destination stage to reflect the branch outcome.
  const stroke = pickNodeColor(targetName ?? sourceName, stageColors);

  return (
    <path
      d={buildSankeyPath(sourceX, targetX, sourceControlX, targetControlX, y0, y1)}
      stroke={stroke}
      strokeWidth={Math.max(1, linkWidth)}
      fill="none"
      strokeOpacity={0.5}
    />
  );
}

export default function SankeyFunnel({ data, stageColors }: SankeyFunnelProps) {
  const hasLinks = data.links.some((link) => link.value > 0);
  const chartHeight = Math.max(420, Math.min(620, data.nodes.length * 60));

  return (
    <div className="panel card-sankey">
      <h2>Pipeline Flow</h2>
      <p className="panel-description">All Applications to OA/Rejected and progress through each stage.</p>
      <div className="sankey-wrapper">
        {hasLinks ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <Sankey
              data={data}
              align="left"
              sort={false}
              nodePadding={22}
              nodeWidth={12}
              linkCurvature={0.56}
              margin={{ top: 32, right: 32, bottom: 40, left: 32 }}
              node={(props) => <SankeyNodeShape {...props} stageColors={stageColors} />}
              link={(props) => <SankeyLinkShape {...props} stageColors={stageColors} />}
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

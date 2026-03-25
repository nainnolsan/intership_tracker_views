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
  stageOrder?: string[];
}

interface SankeyNodeShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
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

function buildRibbonPath(
  sourceX: number,
  targetX: number,
  sourceTop: number,
  sourceBottom: number,
  targetTop: number,
  targetBottom: number,
): string {
  const c0 = sourceX + (targetX - sourceX) * 0.5;
  const c1 = targetX - (targetX - sourceX) * 0.5;

  return [
    `M ${sourceX} ${sourceTop}`,
    `C ${c0} ${sourceTop}, ${c1} ${targetTop}, ${targetX} ${targetTop}`,
    `L ${targetX} ${targetBottom}`,
    `C ${c1} ${targetBottom}, ${c0} ${sourceBottom}, ${sourceX} ${sourceBottom}`,
    'Z',
  ].join(' ');
}

function SankeyNodeShape({ x, y, width, height, fill }: SankeyNodeShapeProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={2}
    />
  );
}

type LayoutNode = {
  index: number;
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  sourceCursor: number;
  targetCursor: number;
};

type LayoutLink = {
  source: number;
  target: number;
  value: number;
  color: string;
};

function getNodeLevel(nodeName: string, stageOrder?: string[]): number {
  const n = nodeName.toLowerCase();
  if (n.includes('applied') && !n.includes('rejected')) return 0;

  if (stageOrder && stageOrder.length > 0) {
    let searchName = n;
    if (n.includes('rejected') && n !== 'rejected') {
      searchName = n.replace('rejected', '').replace('-', '').trim();
    }
    
    for (let i = 0; i < stageOrder.length; i++) {
       const stageId = stageOrder[i].toLowerCase();
       if (searchName.includes(stageId) || stageId.includes(searchName)) {
           return i + 1;
       }
       if ((searchName === 'oa' && stageId === 'onlineassessment') || 
           (stageId === 'oa' && searchName === 'onlineassessment')) {
           return i + 1;
       }
    }
  }

  if (n.includes('onlineassessment') || n === 'oa') return 1;
  if (n.includes('interview') && !n.includes('rejected')) return 2;
  if (n.includes('offer')) return 3;
  if (n.includes('rejected') && n.includes('applied')) return 1;
  if (n.includes('rejected') && (n.includes('oa') || n.includes('onlineassessment'))) return 2;
  if (n.includes('rejected') && n.includes('interview')) return 3;
  return 0;
}

function isRejectedNode(nodeName: string): boolean {
  return nodeName.toLowerCase().includes('rejected');
}

function isOfferNode(nodeName: string): boolean {
  return nodeName.toLowerCase().includes('offer');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function SankeyFunnel({ data, stageColors, stageOrder }: SankeyFunnelProps) {
  const hasLinks = data.links.some((link) => link.value > 0);
  const chartHeight = Math.max(420, Math.min(640, data.nodes.length * 64));

  if (!hasLinks) {
    return (
      <div className="panel card-sankey">
        <h2>Pipeline Flow</h2>
        <p className="panel-description">All Applications to OA/Rejected and progress through each stage.</p>
        <div className="sankey-wrapper">
          <p className="funnel-fallback-note">No pipeline transitions yet. Start updating stages to see flow branches.</p>
        </div>
      </div>
    );
  }

  const viewWidth = 1200;
  const nodeWidth = 12;
  const innerTop = 24;
  const innerBottom = chartHeight - 24;
  const innerHeight = innerBottom - innerTop;

  const nodeValues = data.nodes.map((_, idx) => {
    const outgoing = data.links
      .filter((link) => link.source === idx)
      .reduce((sum, link) => sum + link.value, 0);
    const incoming = data.links
      .filter((link) => link.target === idx)
      .reduce((sum, link) => sum + link.value, 0);
    return Math.max(outgoing, incoming, 0);
  });

  const activeNodeIndices = new Set<number>();
  data.links
    .filter((link) => link.value > 0)
    .forEach((link) => {
      activeNodeIndices.add(link.source);
      activeNodeIndices.add(link.target);
    });

  const totalApplied = Math.max(
    nodeValues[0] ?? 0,
    data.links.filter((link) => link.source === 0).reduce((sum, link) => sum + link.value, 0),
    1,
  );

  const verticalUnit = innerHeight / totalApplied;

  const maxLevel = stageOrder ? stageOrder.length : 3;
  const columnWidth = (viewWidth - 88) / Math.max(1, maxLevel);
  const getColumnX = (lvl: number) => 44 + lvl * columnWidth;

  const nodes: LayoutNode[] = data.nodes.flatMap((node, idx) => {
    if (!activeNodeIndices.has(idx)) {
      return [];
    }

    const level = getNodeLevel(node.name, stageOrder);
    const height = nodeValues[idx] * verticalUnit;
    const x = getColumnX(level);

    let y = innerTop;
    if (level === 0) {
      y = innerTop + (innerHeight - height) / 2;
    } else if (isRejectedNode(node.name)) {
      y = innerBottom - height;
    } else if (isOfferNode(node.name)) {
      y = innerTop + (innerHeight - height) / 2;
    }

    y = clamp(y, innerTop, innerBottom - height);

    return [
      {
        index: idx,
        name: node.name,
        value: nodeValues[idx],
        x,
        y,
        width: nodeWidth,
        height,
        color: pickNodeColor(node.name, stageColors, idx),
        sourceCursor: 0,
        targetCursor: 0,
      },
    ];
  });

  const nodeByIndex = new Map<number, LayoutNode>(nodes.map((n) => [n.index, n]));

  const orderedLinks: LayoutLink[] = data.links
    .filter((link) => link.value > 0)
    .map((link) => {
      const target = data.nodes[link.target]?.name;
      const source = data.nodes[link.source]?.name;
      return {
        ...link,
        color: pickNodeColor(target ?? source, stageColors),
      };
    })
    .sort((a, b) => {
      if (a.source !== b.source) return a.source - b.source;
      const ta = nodeByIndex.get(a.target)?.y ?? 0;
      const tb = nodeByIndex.get(b.target)?.y ?? 0;
      return ta - tb;
    });

  return (
    <div className="panel card-sankey">
      <h2>Pipeline Flow</h2>
      <p className="panel-description">All Applications to OA/Rejected and progress through each stage.</p>
      <div className="sankey-wrapper">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${viewWidth} ${chartHeight}`} preserveAspectRatio="none">
          {orderedLinks.map((link) => {
            const source = nodeByIndex.get(link.source);
            const target = nodeByIndex.get(link.target);

            if (!source || !target) {
              return null;
            }

            const thickness = Math.max(1, link.value * verticalUnit);
            const sourceTop = source.y + source.sourceCursor;
            const sourceBottom = sourceTop + thickness;
            source.sourceCursor += thickness;

            const targetTop = target.y + target.targetCursor;
            const targetBottom = targetTop + thickness;
            target.targetCursor += thickness;

            return (
              <path
                key={`${link.source}-${link.target}-${link.value}`}
                d={buildRibbonPath(
                  source.x + source.width,
                  target.x,
                  sourceTop,
                  sourceBottom,
                  targetTop,
                  targetBottom,
                )}
                fill={link.color}
                fillOpacity={0.52}
                stroke="none"
              >
                <title>{`${source.value} ${source.name} -> ${target.name}: ${link.value}`}</title>
              </path>
            );
          })}

          {nodes.map((node) => (
            <SankeyNodeShape
              key={node.index}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={node.color}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

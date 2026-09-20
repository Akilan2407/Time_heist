import React, { useMemo, useState, useRef } from 'react';
import { BnBStep, Room } from '../../../../shared/types.js';
import { GitBranch, ShieldX, CheckCircle2, Search, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface BnBCrewPanelProps {
  rooms: Room[];
  bnbTree: BnBStep[];
  timeElapsed: number;
  timeBudget: number;
  bnbNodesExplored: number;
  prunedCount: number;
  optimalValue: number;
  roomMap: Map<string, Room>;
}

interface TreeNode {
  id: string;
  parentId: string | null;
  step: BnBStep;
  x: number;
  y: number;
  children: TreeNode[];
}

export const BnBCrewPanel: React.FC<BnBCrewPanelProps> = ({
  rooms,
  bnbTree,
  timeElapsed,
  timeBudget,
  bnbNodesExplored,
  prunedCount,
  optimalValue,
  roomMap
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<BnBStep | null>(null);

  // Filter steps visible up to current time elapsed (using simulated timestamp or proportional progress)
  const visibleSteps = useMemo(() => {
    if (bnbTree.length === 0) return [];
    // If heist is running, reveal steps gradually according to elapsed fraction
    const totalSimulatedTime = bnbTree[bnbTree.length - 1]?.timestamp || 1000;
    const progressFraction = Math.min(1, timeElapsed / Math.max(1, timeBudget * 0.75)); // B&B finishes solver in first 75% of time
    const maxAllowedTimestamp = totalSimulatedTime * progressFraction;

    return bnbTree.filter((step) => step.timestamp <= maxAllowedTimestamp);
  }, [bnbTree, timeElapsed, timeBudget]);

  // Compute current live best value found so far
  const currentBestValue = useMemo(() => {
    let best = 0;
    for (const step of visibleSteps) {
      if (step.currentValue > best) {
        best = step.currentValue;
      }
    }
    return best;
  }, [visibleSteps]);

  // Build tree hierarchy for SVG layout
  const { nodes, links, width, height } = useMemo(() => {
    if (visibleSteps.length === 0) {
      return { nodes: [], links: [], width: 600, height: 400 };
    }

    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Group nodes by level for coordinates
    const levelGroups = new Map<number, BnBStep[]>();
    for (const step of visibleSteps) {
      const lvl = step.level + 1;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(step);
    }

    const maxLevel = Math.max(...Array.from(levelGroups.keys()), 0);
    const LEVEL_HEIGHT = 70;
    const NODE_SPACING = 65;

    let maxNodesInAnyLevel = 1;
    levelGroups.forEach((group) => {
      maxNodesInAnyLevel = Math.max(maxNodesInAnyLevel, group.length);
    });

    const svgWidth = Math.max(600, maxNodesInAnyLevel * NODE_SPACING + 100);
    const svgHeight = Math.max(380, (maxLevel + 1) * LEVEL_HEIGHT + 80);

    // Compute coordinates
    levelGroups.forEach((group, lvl) => {
      const count = group.length;
      const totalWidthForLevel = count * NODE_SPACING;
      const startX = (svgWidth - totalWidthForLevel) / 2 + NODE_SPACING / 2;

      group.forEach((step, idx) => {
        const x = startX + idx * NODE_SPACING;
        const y = 40 + lvl * LEVEL_HEIGHT;
        const node: TreeNode = {
          id: step.nodeId,
          parentId: step.parentId,
          step,
          x,
          y,
          children: []
        };
        nodeMap.set(step.nodeId, node);
      });
    });

    // Connect parents and create links
    const linkList: { source: TreeNode; target: TreeNode; branchType: string }[] = [];
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children.push(node);
        linkList.push({
          source: parent,
          target: node,
          branchType: node.step.branchType
        });
      } else if (!node.parentId) {
        roots.push(node);
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: linkList,
      width: svgWidth,
      height: svgHeight
    };
  }, [visibleSteps]);

  const livePrunedCount = visibleSteps.filter((s) => s.status === 'pruned').length;

  return (
    <div className="glass-panel glass-panel-glow-bnb" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <GitBranch size={18} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 700 }}>
              B&B CREW (LIVE TREE)
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best-First Branch & Bound</div>
          </div>
        </div>

        {/* Live Best */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best Solution</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
            ${currentBestValue}k
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <span>Explored: <strong style={{ color: '#38bdf8' }}>{visibleSteps.length}</strong></span>
          <span>Pruned: <strong style={{ color: '#ef4444' }}>{livePrunedCount}</strong></span>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className="btn-cyber btn-secondary"
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="btn-cyber btn-secondary"
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="btn-cyber btn-secondary"
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            title="Reset View"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Interactive SVG Search Tree */}
      <div
        style={{
          flex: 1,
          background: 'rgba(5, 8, 14, 0.7)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          overflow: 'auto',
          position: 'relative',
          minHeight: '320px',
          maxHeight: '420px',
          cursor: 'grab'
        }}
      >
        <svg
          width={width * zoom}
          height={height * zoom}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', margin: 'auto' }}
        >
          <defs>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links / Edges */}
          {links.map((link, idx) => {
            const isTargetPruned = link.target.step.status === 'pruned';
            return (
              <g key={`link_${idx}`}>
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={isTargetPruned ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.35)'}
                  strokeWidth={isTargetPruned ? 1.5 : 2}
                  strokeDasharray={isTargetPruned ? '4,4' : undefined}
                />
                {/* Branch type label */}
                <text
                  x={(link.source.x + link.target.x) / 2 + (link.branchType === 'include' ? -10 : 10)}
                  y={(link.source.y + link.target.y) / 2}
                  fill={link.branchType === 'include' ? '#34d399' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {link.branchType === 'include' ? '+Inc' : '-Exc'}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isPruned = node.step.status === 'pruned';
            const isBest = node.step.status === 'best-so-far';
            const isRoot = node.step.branchType === 'root';
            const isSelected = selectedNode?.nodeId === node.step.nodeId;

            let fillColor = 'rgba(30, 41, 59, 0.9)';
            let strokeColor = '#38bdf8';
            let radius = 16;

            if (isPruned) {
              fillColor = 'rgba(239, 68, 68, 0.2)';
              strokeColor = '#ef4444';
            } else if (isBest) {
              fillColor = '#10b981';
              strokeColor = '#6ee7b7';
              radius = 18;
            } else if (isRoot) {
              fillColor = 'rgba(0, 240, 255, 0.3)';
              strokeColor = '#00f0ff';
            }

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node.step)}
                style={{ cursor: 'pointer' }}
                filter={isBest ? 'url(#glow-green)' : undefined}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={fillColor}
                  stroke={isSelected ? '#ffffff' : strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Node Text Label (value or X) */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={isBest ? '#050a14' : isPruned ? '#fca5a5' : '#f8fafc'}
                  fontSize={isPruned ? '11' : '10'}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {isPruned ? '✕' : isRoot ? 'R' : `$${node.step.currentValue}`}
                </text>

                {/* Bound label beneath node */}
                {!isPruned && node.step.bound > 0 && (
                  <text
                    x={node.x}
                    y={node.y + 26}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                  >
                    B:{Math.round(node.step.bound)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector Footer */}
      <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', minHeight: '44px' }}>
        {selectedNode ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="font-mono" style={{ color: '#00f0ff' }}>{selectedNode.nodeId}</span>: {selectedNode.branchType.toUpperCase()} | Val: <strong style={{ color: '#f59e0b' }}>${selectedNode.currentValue}k</strong> | Cost: <strong style={{ color: '#38bdf8' }}>{selectedNode.currentTimeCost}s</strong> | Bound: <strong style={{ color: '#10b981' }}>{selectedNode.bound > 0 ? `$${Math.round(selectedNode.bound)}k` : 'N/A'}</strong>
            </div>
            {selectedNode.status === 'pruned' && (
              <span className="badge badge-pruned">
                {selectedNode.pruneReason === 'time_exceeded' ? '⏳ Time Exceeded' : '📉 Bound ≤ Best'}
              </span>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Click any node in the live Branch & Bound tree to inspect bounds & decision branches.
          </div>
        )}
      </div>
    </div>
  );
};

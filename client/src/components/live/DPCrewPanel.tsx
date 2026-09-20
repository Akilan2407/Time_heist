import React from 'react';
import { Room, PathItem } from '../../../../shared/types.js';
import { Layers, CheckCircle2, Clock, Cpu, ArrowRight } from 'lucide-react';
import { getStateAtTime } from '../../utils/replay.js';

interface DPCrewPanelProps {
  rooms: Room[];
  dpPath: PathItem[];
  timeElapsed: number;
  timeBudget: number;
  dpCellsComputed: number;
  roomMap: Map<string, Room>;
}

export const DPCrewPanel: React.FC<DPCrewPanelProps> = ({
  rooms,
  dpPath,
  timeElapsed,
  timeBudget,
  dpCellsComputed,
  roomMap
}) => {
  const currentState = getStateAtTime(dpPath, timeElapsed, roomMap);

  return (
    <div className="glass-panel glass-panel-glow-dp" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
            <Layers size={18} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#c084fc', fontWeight: 700 }}>
              DP CREW (PRECOMPUTED)
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bottom-Up Knapsack Plan</div>
          </div>
        </div>

        {/* DP Live Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secured Loot</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>
            ${currentState.totalValue}k
          </div>
        </div>
      </div>

      {/* DP Stats Header */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="#c084fc" /> Table: <strong style={{ color: '#f8fafc' }}>{dpCellsComputed} cells</strong>
        </span>
        <span className="badge badge-dp" style={{ fontSize: '0.65rem' }}>
          O(n·W) OPTIMAL
        </span>
      </div>

      {/* Execution Path Route */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', maxHeight: '520px' }}>
        {dpPath.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No viable rooms within budget.
          </div>
        ) : (
          dpPath.map((item, idx) => {
            const room = roomMap.get(item.roomId);
            const isLooted = currentState.lootedRoomIds.includes(item.roomId);
            const isCurrent = currentState.activeRoomId === item.roomId;
            const isPending = !isLooted && !isCurrent;

            return (
              <div
                key={item.roomId}
                style={{
                  background: isCurrent
                    ? 'rgba(168, 85, 247, 0.15)'
                    : isLooted
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isCurrent
                    ? '1px solid #c084fc'
                    : isLooted
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Active Progress Bar */}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${currentState.activeProgress * 100}%`,
                    background: 'linear-gradient(90deg, rgba(168,85,247,0.2), rgba(168,85,247,0.4))',
                    transition: 'width 0.1s linear',
                    zIndex: 0
                  }} />
                )}

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#c084fc' }}>
                        Step {idx + 1}
                      </span>
                      <span className="font-display" style={{ fontWeight: 700, fontSize: '0.9rem', color: isLooted ? '#34d399' : '#f8fafc' }}>
                        {room ? room.name : item.roomId}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Window: <strong style={{ color: '#00f0ff' }}>{item.timestamp}s - {item.timestamp + item.duration}s</strong></span>
                      <span>Value: <strong style={{ color: '#f59e0b' }}>${item.value}k</strong></span>
                    </div>
                  </div>

                  <div>
                    {isLooted ? (
                      <span className="badge badge-bnb" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} /> SECURED
                      </span>
                    ) : isCurrent ? (
                      <span className="badge badge-dp animate-pulse-glow" style={{ fontSize: '0.7rem' }}>
                        EXECUTING ({Math.round(currentState.activeProgress * 100)}%)
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                        SCHEDULED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

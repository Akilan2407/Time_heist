import React, { useState } from 'react';
import { Room, PlayerAction } from '../../../../shared/types.js';
import { User, CheckCircle2, Lock, Zap, DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio.js';

interface PlayerPanelProps {
  rooms: Room[];
  timeBudget: number;
  timeRemaining: number;
  timeElapsed: number;
  lootedRoomIds: Set<string>;
  activeLootingRoomId: string | null;
  activeLootingProgress: number; // 0 to 1
  onLootRoom: (room: Room) => void;
  playerTotalValue: number;
  isFinished: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  rooms,
  timeBudget,
  timeRemaining,
  timeElapsed,
  lootedRoomIds,
  activeLootingRoomId,
  activeLootingProgress,
  onLootRoom,
  playerTotalValue,
  isFinished
}) => {
  const [hintActive, setHintActive] = useState(false);

  // Find best unlooted room by value/time cost ratio for the greedy power-up
  const unlootedRooms = rooms.filter((r) => !lootedRoomIds.has(r.id) && r.timeCost <= timeRemaining);
  const bestRatioRoom = unlootedRooms.length > 0
    ? [...unlootedRooms].sort((a, b) => (b.value / b.timeCost) - (a.value / a.timeCost))[0]
    : null;

  const handleUseGreedyHint = () => {
    soundFx.playLootSuccess();
    setHintActive(true);
    setTimeout(() => setHintActive(false), 4000);
  };

  return (
    <div className="glass-panel glass-panel-glow-player" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,240,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
            <User size={18} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#00f0ff', fontWeight: 700 }}>
              YOU (OPERATOR)
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Manual Real-Time Selection</div>
          </div>
        </div>

        {/* Live Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secured Loot</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00f0ff' }}>
            ${playerTotalValue}k
          </div>
        </div>
      </div>

      {/* Power-up bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Looted: <strong style={{ color: '#f8fafc' }}>{lootedRoomIds.size}</strong> / {rooms.length} rooms
        </span>
        <button
          onClick={handleUseGreedyHint}
          disabled={hintActive || isFinished || unlootedRooms.length === 0}
          className="btn-cyber btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
          title="Highlight room with highest Value-to-Time density"
        >
          <Sparkles size={13} />
          <span>{hintActive ? 'Greedy Scan Active!' : 'Greedy Hint'}</span>
        </button>
      </div>

      {/* Room Selection Grid */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', maxHeight: '520px' }}>
        {rooms.map((room) => {
          const isLooted = lootedRoomIds.has(room.id);
          const isLooting = activeLootingRoomId === room.id;
          const canAfford = room.timeCost <= timeRemaining;
          const isBestHint = hintActive && bestRatioRoom?.id === room.id;
          const isDisabled = isLooted || isFinished || (!isLooting && !canAfford) || (activeLootingRoomId !== null && !isLooting);

          return (
            <div
              key={room.id}
              onClick={() => {
                if (!isDisabled && !isLooting) {
                  soundFx.playLockpickTick();
                  onLootRoom(room);
                }
              }}
              style={{
                background: isLooting
                  ? 'rgba(0, 240, 255, 0.12)'
                  : isLooted
                  ? 'rgba(16, 185, 129, 0.1)'
                  : isBestHint
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isLooting
                  ? '1px solid #00f0ff'
                  : isLooted
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : isBestHint
                  ? '2px solid #f59e0b'
                  : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: !isDisabled ? 'pointer' : 'default',
                opacity: (!canAfford && !isLooted && !isLooting) ? 0.4 : 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Lockpicking Progress Fill */}
              {isLooting && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${activeLootingProgress * 100}%`,
                  background: 'linear-gradient(90deg, rgba(0,240,255,0.2), rgba(0,240,255,0.4))',
                  transition: 'width 0.1s linear',
                  zIndex: 0
                }} />
              )}

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: '0.9rem', color: isLooted ? '#34d399' : '#f8fafc' }}>
                      {room.name}
                    </span>
                    {isBestHint && (
                      <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.65rem' }}>
                        TOP RATIO
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Cost: <strong style={{ color: '#00f0ff' }}>{room.timeCost}s</strong></span>
                    <span>Value: <strong style={{ color: '#f59e0b' }}>${room.value}k</strong></span>
                    <span>Ratio: <strong style={{ color: '#10b981' }}>{(room.value / room.timeCost).toFixed(1)}k/s</strong></span>
                  </div>
                </div>

                <div>
                  {isLooted ? (
                    <span className="badge badge-bnb" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={12} /> SECURED
                    </span>
                  ) : isLooting ? (
                    <span className="badge badge-player animate-pulse-glow" style={{ fontSize: '0.7rem' }}>
                      LOCKPICKING ({Math.round(activeLootingProgress * 100)}%)
                    </span>
                  ) : !canAfford ? (
                    <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem' }}>
                      NO TIME
                    </span>
                  ) : (
                    <button
                      className="btn-cyber btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                      disabled={isDisabled}
                    >
                      LOOT
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

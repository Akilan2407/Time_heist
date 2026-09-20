import React from 'react';
import { Room, RoomPosition, CharacterStatus } from '../../shared/types.js';
import { Character, CharacterProps } from './Character.js';
import { Lock, CheckCircle2, ShieldAlert, Sparkles, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio.js';

export interface VaultCanvasProps {
  rooms: Room[];
  roomPositions: RoomPosition[];
  lootedRoomIds: Set<string> | string[];
  queue?: string[];
  activeRoomId?: string | null;
  onRoomClick?: (room: Room) => void;
  characters: CharacterProps[];
  width?: number;
  height?: number;
  disabledRoomIds?: Set<string>;
  hintRoomId?: string | null;
  title?: string;
  isInteractive?: boolean;
}

export const VaultCanvas: React.FC<VaultCanvasProps> = ({
  rooms,
  roomPositions,
  lootedRoomIds,
  queue = [],
  activeRoomId = null,
  onRoomClick,
  characters,
  width = 740,
  height = 440,
  disabledRoomIds = new Set(),
  hintRoomId = null,
  title = 'VAULT BLUEPRINT FLOOR PLAN',
  isInteractive = true
}) => {
  const lootedSet = lootedRoomIds instanceof Set ? lootedRoomIds : new Set(lootedRoomIds);
  const posMap = new Map(roomPositions.map((p) => [p.roomId, p]));

  // Connect sequential rooms with high-tech conduit corridors
  const conduits: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < roomPositions.length - 1; i++) {
    conduits.push({
      x1: roomPositions[i].x,
      y1: roomPositions[i].y,
      x2: roomPositions[i + 1].x,
      y2: roomPositions[i + 1].y
    });
  }

  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, rgba(15, 25, 45, 0.95) 0%, rgba(5, 8, 15, 0.98) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.35)',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(0, 240, 255, 0.08)',
        margin: '0 auto',
        borderRadius: '16px',
        userSelect: 'none'
      }}
    >
      {/* Blueprint Header HUD */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '18px',
          right: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-player" style={{ fontSize: '0.72rem', padding: '3px 10px', background: 'rgba(0,240,255,0.2)' }}>
            {title}
          </span>
          {queue.length > 0 && (
            <span className="badge" style={{ background: 'rgba(245,158,11,0.25)', color: '#f59e0b', border: '1px solid #f59e0b', fontSize: '0.7rem' }}>
              TARGETS QUEUED: {queue.length}
            </span>
          )}
        </div>
        <div className="font-mono" style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 600 }}>
          SEC-GRID 2D HIGH-RES BLUEPRINT
        </div>
      </div>

      {/* SVG Conduits & Corridor Grid */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      >
        <defs>
          <pattern id="canvas-grid-large" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 240, 255, 0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#canvas-grid-large)" />

        {/* Security Conduits */}
        {conduits.map((c, i) => (
          <g key={`conduit_${i}`}>
            <line
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="4"
              strokeDasharray="6 6"
            />
          </g>
        ))}

        {/* Start Airlock Entry Line */}
        <line
          x1={30}
          y1={60}
          x2={roomPositions[0]?.x || 80}
          y2={roomPositions[0]?.y || 80}
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth="3"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Entry Airlock Terminal */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '60px',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
          pointerEvents: 'none',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            fontSize: '0.72rem',
            fontWeight: 900,
            boxShadow: '0 0 14px rgba(16,185,129,0.5)'
          }}
        >
          IN
        </div>
        <div className="font-mono" style={{ fontSize: '0.62rem', color: '#10b981', marginTop: '2px', fontWeight: 700 }}>
          AIRLOCK
        </div>
      </div>

      {/* Vault Room Portals */}
      {rooms.map((room) => {
        const pos = posMap.get(room.id);
        if (!pos) return null;

        const isLooted = lootedSet.has(room.id);
        const isActive = activeRoomId === room.id;
        const queueIndex = queue.indexOf(room.id);
        const isQueued = queueIndex !== -1;
        const isDisabled = disabledRoomIds.has(room.id) && !isLooted && !isActive;
        const isHint = hintRoomId === room.id;

        return (
          <div
            key={room.id}
            onClick={() => {
              if (isInteractive && onRoomClick && !isLooted && !isDisabled) {
                onRoomClick(room);
              }
            }}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: isInteractive && !isLooted && !isDisabled ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isDisabled ? 0.35 : 1,
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Active Radar Wave */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  border: '2.5px solid #00f0ff',
                  animation: 'radar-ping 1.2s ease-out infinite',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Room Portal Node (Enlarged) */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: isLooted
                  ? 'rgba(16, 185, 129, 0.2)'
                  : isActive
                  ? 'rgba(0, 240, 255, 0.3)'
                  : isHint
                  ? 'rgba(245, 158, 11, 0.3)'
                  : isQueued
                  ? 'rgba(168, 85, 247, 0.25)'
                  : 'rgba(18, 26, 42, 0.92)',
                border: isLooted
                  ? '2px solid #10b981'
                  : isActive
                  ? '2.5px solid #00f0ff'
                  : isHint
                  ? '2.5px solid #f59e0b'
                  : isQueued
                  ? '2px solid #c084fc'
                  : '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: isLooted
                  ? '0 0 20px rgba(16, 185, 129, 0.5)'
                  : isActive
                  ? '0 0 26px rgba(0, 240, 255, 0.75)'
                  : isHint
                  ? '0 0 22px rgba(245, 158, 11, 0.65)'
                  : isQueued
                  ? '0 0 16px rgba(168, 85, 247, 0.5)'
                  : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.2s ease'
              }}
            >
              {isLooted ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : isActive ? (
                <Sparkles size={24} color="#00f0ff" className="animate-pulse-glow" />
              ) : (
                <Lock size={22} color={isHint ? '#f59e0b' : '#94a3b8'} />
              )}

              {/* Queue Position Chip */}
              {isQueued && !isLooted && (
                <div
                  className="font-mono"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#a855f7',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px #a855f7',
                    border: '1.5px solid #ffffff'
                  }}
                >
                  Q{queueIndex + 1}
                </div>
              )}
            </div>

            {/* Room Info Label */}
            <div style={{ textAlign: 'center', marginTop: '6px', maxWidth: '100px' }}>
              <div
                className="font-display"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isLooted ? '#34d399' : '#f8fafc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {room.name}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: isLooted ? '#10b981' : '#00f0ff'
                }}
              >
                ${room.value}k • {room.timeCost}s
              </div>
            </div>
          </div>
        );
      })}

      {/* Render All Animated Characters */}
      {characters.map((char, idx) => (
        <Character key={`char_${char.variant || 'char'}_${idx}`} {...char} />
      ))}
    </div>
  );
};

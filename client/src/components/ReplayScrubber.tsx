import React, { useState, useEffect, useMemo } from 'react';
import { Heist, HeistResult, PlayerAction, MovementLogEntry, Room } from '../../../shared/types.js';
import { getStateAtTime, getPlayerStateAtTime } from '../utils/replay.js';
import { computeRoomPositions, getPositionAtTime, convertPathToMovementLog } from '../../../shared/utils/movement.js';
import { VaultCanvas } from './VaultCanvas.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  User, 
  Layers, 
  GitBranch, 
  Clock, 
  CheckCircle2, 
  Activity,
  MapPin,
  ShieldAlert,
  Eye
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface ReplayScrubberProps {
  heist: Heist;
  heistResult: HeistResult;
  playerActions: PlayerAction[];
  playerMovementLog?: MovementLogEntry[];
  roomMap: Map<string, Room>;
}

export const ReplayScrubber: React.FC<ReplayScrubberProps> = ({
  heist,
  heistResult,
  playerActions,
  playerMovementLog = [],
  roomMap
}) => {
  const [scrubTime, setScrubTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  // Compute fixed 2D room positions for the Replay Arena
  const roomPositions = useMemo(() => computeRoomPositions(heist.rooms, 760, 380), [heist.rooms]);

  // Pre-convert DP and BnB paths to movement logs for synchronized character tracking
  const dpMovementLog = useMemo(
    () => convertPathToMovementLog(heistResult.dpPath, roomPositions),
    [heistResult.dpPath, roomPositions]
  );

  const bnbMovementLog = useMemo(
    () => convertPathToMovementLog(heistResult.bnbPath, roomPositions),
    [heistResult.bnbPath, roomPositions]
  );

  // Synchronized character positions at scrubTime
  const playerPos = useMemo(
    () => getPositionAtTime(playerMovementLog, roomPositions, scrubTime, 30, 60),
    [playerMovementLog, roomPositions, scrubTime]
  );

  const dpPos = useMemo(
    () => getPositionAtTime(dpMovementLog, roomPositions, scrubTime, 30, 100),
    [dpMovementLog, roomPositions, scrubTime]
  );

  const bnbPos = useMemo(
    () => getPositionAtTime(bnbMovementLog, roomPositions, scrubTime, 30, 140),
    [bnbMovementLog, roomPositions, scrubTime]
  );

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 100 / playbackSpeed;
    const interval = setInterval(() => {
      setScrubTime((prev) => {
        if (prev >= heist.timeBudget) {
          setIsPlaying(false);
          return heist.timeBudget;
        }
        return Math.min(heist.timeBudget, Math.round((prev + 0.1) * 10) / 10);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, heist.timeBudget]);

  const togglePlay = () => {
    soundFx.playClick();
    if (scrubTime >= heist.timeBudget) {
      setScrubTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    soundFx.playClick();
    setIsPlaying(false);
    setScrubTime(0);
  };

  // Recompute synchronized state summaries at scrubTime
  const playerState = getPlayerStateAtTime(playerActions, scrubTime, roomMap);
  const dpState = getStateAtTime(heistResult.dpPath, scrubTime, roomMap);
  const bnbState = getStateAtTime(heistResult.bnbPath, scrubTime, roomMap);

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(0,240,255,0.3)', marginTop: '24px' }}>
      
      {/* Scrubber Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-player">REPLAY ARENA</span>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Synchronized Multi-Agent Timeline
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            All 3 operatives and sentry drone guards patrol simultaneously. Timestamp: <strong style={{ color: '#00f0ff' }}>t = {scrubTime.toFixed(1)}s</strong> / {heist.timeBudget}s
          </div>
        </div>

        {/* Playback Transport Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={togglePlay}
            className="btn-cyber btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
          </button>

          <button
            onClick={handleReset}
            className="btn-cyber btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Reset Timeline to t=0"
          >
            <RotateCcw size={16} />
          </button>

          {/* Speed toggles */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  soundFx.playClick();
                  setPlaybackSpeed(spd);
                }}
                style={{
                  background: playbackSpeed === spd ? '#00f0ff' : 'transparent',
                  color: playbackSpeed === spd ? '#050a14' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slider Bar & Time Ticks */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="range"
          min={0}
          max={heist.timeBudget}
          step={0.1}
          value={scrubTime}
          onChange={(e) => {
            setScrubTime(Number(e.target.value));
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0.0s (Start)</span>
          <span className="font-mono" style={{ color: '#00f0ff', fontWeight: 700, fontSize: '0.9rem' }}>
            Current: {scrubTime.toFixed(1)}s / {heist.timeBudget}s
          </span>
          <span>{heist.timeBudget}.0s (Airlock Seal)</span>
        </div>
      </div>

      {/* Synchronized Vault Blueprint Arena (Multi-Character View with Guards) */}
      <div style={{ marginBottom: '20px' }}>
        <VaultCanvas
          rooms={heist.rooms}
          roomPositions={roomPositions}
          lootedRoomIds={playerState.lootedRoomIds}
          activeRoomId={playerPos.activeRoomId}
          guards={heist.guards}
          currentTime={scrubTime}
          title="TRI-CREW & SENTRY PATROL REPLAY ARENA"
          characters={[
            {
              x: playerPos.x,
              y: playerPos.y,
              status: playerPos.status,
              variant: 'player',
              facing: playerPos.facing,
              name: 'OPERATOR',
              transitionDuration: 0
            },
            {
              x: dpPos.x,
              y: dpPos.y,
              status: dpPos.status,
              variant: 'dp',
              facing: dpPos.facing,
              name: 'DP CREW',
              transitionDuration: 0
            },
            {
              x: bnbPos.x,
              y: bnbPos.y,
              status: bnbPos.status,
              variant: 'bnb',
              facing: bnbPos.facing,
              name: 'B&B CREW',
              transitionDuration: 0
            }
          ]}
          width={760}
          height={380}
          isInteractive={false}
        />
      </div>

      {/* 3 Synchronized Summary Cards at Time t */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Player Snapshot */}
        <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#00f0ff" />
              <span className="font-display" style={{ fontWeight: 700, color: '#00f0ff', fontSize: '0.9rem' }}>YOU (OPERATOR)</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#00f0ff', fontSize: '1rem' }}>
              ${playerState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            State: <strong style={{ color: playerPos.status === 'caught' ? '#ef4444' : '#f8fafc' }}>{playerPos.status.toUpperCase()}</strong> ({playerState.currentActivity})
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', minHeight: '48px', maxHeight: '70px', overflowY: 'auto', fontSize: '0.7rem' }}>
            {playerState.lootedRoomIds.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              playerState.lootedRoomIds.map((id) => (
                <div key={id} style={{ color: '#34d399' }}>✓ {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)</div>
              ))
            )}
          </div>
        </div>

        {/* DP Crew Snapshot */}
        <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="#c084fc" />
              <span className="font-display" style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.9rem' }}>DP CREW</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#c084fc', fontSize: '1rem' }}>
              ${dpState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            State: <strong style={{ color: '#c084fc' }}>{dpPos.status.toUpperCase()}</strong> ({dpState.currentActivity})
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', minHeight: '48px', maxHeight: '70px', overflowY: 'auto', fontSize: '0.7rem' }}>
            {dpState.lootedRoomIds.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              dpState.lootedRoomIds.map((id) => (
                <div key={id} style={{ color: '#c084fc' }}>✓ {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)</div>
              ))
            )}
          </div>
        </div>

        {/* B&B Crew Snapshot */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitBranch size={16} color="#10b981" />
              <span className="font-display" style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>B&B CREW</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
              ${bnbState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            State: <strong style={{ color: '#34d399' }}>{bnbPos.status.toUpperCase()}</strong> ({bnbState.currentActivity})
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px', minHeight: '48px', maxHeight: '70px', overflowY: 'auto', fontSize: '0.7rem' }}>
            {bnbState.lootedRoomIds.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              bnbState.lootedRoomIds.map((id) => (
                <div key={id} style={{ color: '#34d399' }}>✓ {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)</div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

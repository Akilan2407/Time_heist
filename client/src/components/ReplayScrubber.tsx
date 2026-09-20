import React, { useState, useEffect } from 'react';
import { Heist, HeistResult, PlayerAction, Room } from '../../../shared/types.js';
import { getStateAtTime, getPlayerStateAtTime } from '../utils/replay.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  User, 
  Layers, 
  GitBranch, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface ReplayScrubberProps {
  heist: Heist;
  heistResult: HeistResult;
  playerActions: PlayerAction[];
  roomMap: Map<string, Room>;
}

export const ReplayScrubber: React.FC<ReplayScrubberProps> = ({
  heist,
  heistResult,
  playerActions,
  roomMap
}) => {
  const [scrubTime, setScrubTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

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

  // Recompute synchronized states at scrubTime
  const playerState = getPlayerStateAtTime(playerActions, scrubTime, roomMap);
  const dpState = getStateAtTime(heistResult.dpPath, scrubTime, roomMap);
  const bnbState = getStateAtTime(heistResult.bnbPath, scrubTime, roomMap);

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(0,240,255,0.3)', marginTop: '24px' }}>
      
      {/* Scrubber Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-player">REPLAY OVERLAY</span>
            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              Synchronized Timeline Scrubber
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Drag the timeline to inspect each party's decision state at timestamp <strong style={{ color: '#00f0ff' }}>t = {scrubTime.toFixed(1)}s</strong>
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
      <div style={{ marginBottom: '24px' }}>
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

      {/* 3 Synchronized Comparison Panels at Time t */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Player Snapshot */}
        <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#00f0ff" />
              <span className="font-display" style={{ fontWeight: 700, color: '#00f0ff' }}>YOU (OPERATOR)</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#00f0ff', fontSize: '1.1rem' }}>
              ${playerState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Activity: <strong style={{ color: '#f8fafc' }}>{playerState.currentActivity}</strong>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Time Spent: <strong style={{ color: '#00f0ff' }}>{playerState.timeUsed}s</strong> | Looted: <strong style={{ color: '#10b981' }}>{playerState.lootedRoomIds.length}</strong>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px', minHeight: '64px', maxHeight: '100px', overflowY: 'auto' }}>
            {playerState.lootedRoomIds.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              playerState.lootedRoomIds.map((id) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#34d399', marginBottom: '2px' }}>
                  <CheckCircle2 size={12} /> {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)
                </div>
              ))
            )}
          </div>
        </div>

        {/* DP Crew Snapshot */}
        <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="#c084fc" />
              <span className="font-display" style={{ fontWeight: 700, color: '#c084fc' }}>DP CREW</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#c084fc', fontSize: '1.1rem' }}>
              ${dpState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Activity: <strong style={{ color: '#f8fafc' }}>{dpState.currentActivity}</strong>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Time Spent: <strong style={{ color: '#c084fc' }}>{dpState.timeUsed}s</strong> | Looted: <strong style={{ color: '#10b981' }}>{dpState.lootedRoomIds.length}</strong>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px', minHeight: '64px', maxHeight: '100px', overflowY: 'auto' }}>
            {dpState.lootedRoomIds.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              dpState.lootedRoomIds.map((id) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#c084fc', marginBottom: '2px' }}>
                  <CheckCircle2 size={12} /> {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)
                </div>
              ))
            )}
          </div>
        </div>

        {/* B&B Crew Snapshot */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitBranch size={16} color="#10b981" />
              <span className="font-display" style={{ fontWeight: 700, color: '#10b981' }}>B&B CREW</span>
            </div>
            <span className="font-mono" style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
              ${bnbState.totalValue}k
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Activity: <strong style={{ color: '#f8fafc' }}>{bnbState.currentActivity}</strong>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Time Spent: <strong style={{ color: '#10b981' }}>{bnbState.timeUsed}s</strong> | Looted: <strong style={{ color: '#10b981' }}>{bnbState.lootedRoomIds.length}</strong>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px', minHeight: '64px', maxHeight: '100px', overflowY: 'auto' }}>
            {bnbState.lootedRoomIds.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No rooms secured yet at t={scrubTime.toFixed(1)}s</span>
            ) : (
              bnbState.lootedRoomIds.map((id) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#34d399', marginBottom: '2px' }}>
                  <CheckCircle2 size={12} /> {roomMap.get(id)?.name || id} (+${roomMap.get(id)?.value}k)
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

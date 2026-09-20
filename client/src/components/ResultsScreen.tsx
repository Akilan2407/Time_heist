import React, { useState, useMemo } from 'react';
import { Heist, HeistResult, PlayerAction, Room } from '../../../shared/types.js';
import { ReplayScrubber } from './ReplayScrubber.js';
import { 
  Trophy, 
  Award, 
  Cpu, 
  GitBranch, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  ChevronRight,
  Sparkles,
  BarChart3,
  Network
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface ResultsScreenProps {
  heist: Heist;
  heistResult: HeistResult;
  playerActions: PlayerAction[];
  onPlayAgain: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  heist,
  heistResult,
  playerActions,
  onPlayAgain
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'tree'>('summary');
  const roomMap = useMemo(() => new Map(heist.rooms.map((r) => [r.id, r])), [heist.rooms]);

  // Compute player final total
  const { playerTotalValue, playerTotalTime, playerValid } = useMemo(() => {
    let val = 0;
    let time = 0;
    const seen = new Set<string>();
    let valid = true;

    for (const act of playerActions) {
      const room = roomMap.get(act.roomId);
      if (!room || seen.has(act.roomId)) {
        valid = false;
        continue;
      }
      seen.add(act.roomId);
      val += room.value;
      time += room.timeCost;
    }

    if (time > heist.timeBudget) valid = false;

    return { playerTotalValue: val, playerTotalTime: time, playerValid: valid };
  }, [playerActions, roomMap, heist.timeBudget]);

  const optimalValue = heistResult.optimalValue;
  const ratio = optimalValue > 0 ? (playerTotalValue / optimalValue) : 1;

  let grade = 'F';
  let gradeColor = '#ef4444';
  let gradeTitle = 'Airlock Trapped';

  if (!playerValid) {
    grade = 'BUSTED';
    gradeColor = '#ef4444';
    gradeTitle = 'Time Limit Exceeded!';
  } else if (ratio >= 0.999) {
    grade = 'S';
    gradeColor = '#f59e0b';
    gradeTitle = 'Algorithmic Mastermind (100% Optimal)';
  } else if (ratio >= 0.85) {
    grade = 'A';
    gradeColor = '#10b981';
    gradeTitle = 'Master Infiltrator (Near-Optimal)';
  } else if (ratio >= 0.70) {
    grade = 'B';
    gradeColor = '#38bdf8';
    gradeTitle = 'Professional Thief';
  } else if (ratio >= 0.50) {
    grade = 'C';
    gradeColor = '#a855f7';
    gradeTitle = 'Amateur Burglar';
  }

  const maxScore = Math.max(optimalValue, playerTotalValue, 1);

  return (
    <div className="layout-container">
      {/* Top Banner: Debrief & Rating */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div className="scanline-effect" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-player">HEIST DEBRIEF</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {heist.difficulty} Difficulty
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc' }}>
              Operation Complete
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
              Mission: <strong style={{ color: '#f8fafc' }}>{heist.name}</strong> • Time Budget: <strong style={{ color: '#00f0ff' }}>{heist.timeBudget}s</strong>
            </p>
          </div>

          {/* Grade Stamp */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: `2px solid ${gradeColor}`,
            boxShadow: `0 0 30px ${gradeColor}44`,
            borderRadius: '16px',
            padding: '16px 28px',
            textAlign: 'center',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operator Rating</div>
            <div className="font-display" style={{ fontSize: '3.2rem', fontWeight: 900, color: gradeColor, lineHeight: 1, margin: '4px 0' }}>
              {grade}
            </div>
            <div style={{ fontSize: '0.8rem', color: gradeColor, fontWeight: 600 }}>
              {gradeTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Score Comparison Bars */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px' }}>
        <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} color="#00f0ff" />
          Heist Scoreboard & Loot Comparison
        </h2>

        {/* Player Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🧑 You (Operator) {playerValid ? `(${playerActions.length} rooms in ${playerTotalTime}s)` : '(INVALID RUN)'}
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#00f0ff', fontSize: '1.1rem' }}>
              ${playerTotalValue}k <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({Math.round(ratio * 100)}% optimal)</span>
            </span>
          </div>
          <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (playerTotalValue / maxScore) * 100)}%`,
              background: 'linear-gradient(90deg, #00f0ff, #0099ff)',
              boxShadow: '0 0 12px #00f0ff'
            }} />
          </div>
        </div>

        {/* DP Crew Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🤖 DP Crew (Bottom-Up Dynamic Programming)
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#c084fc', fontSize: '1.1rem' }}>
              ${optimalValue}k <span style={{ fontSize: '0.8rem', color: '#10b981' }}>(100% Ground Truth)</span>
            </span>
          </div>
          <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(optimalValue / maxScore) * 100}%`,
              background: 'linear-gradient(90deg, #a855f7, #c084fc)',
              boxShadow: '0 0 12px #a855f7'
            }} />
          </div>
        </div>

        {/* Branch & Bound Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Branch & Bound Crew (Best-First with Fractional Bound)
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>
              ${optimalValue}k <span style={{ fontSize: '0.8rem', color: '#10b981' }}>(100% Match)</span>
            </span>
          </div>
          <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(optimalValue / maxScore) * 100}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              boxShadow: '0 0 12px #10b981'
            }} />
          </div>
        </div>
      </div>

      {/* CS Efficiency & Complexity Callout (Viva / Computer Science Highlights) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* DP Metrics Card */}
        <div className="glass-panel" style={{ padding: '20px 24px', borderColor: 'rgba(168,85,247,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Layers size={22} color="#c084fc" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#c084fc', fontWeight: 700 }}>
              Dynamic Programming Stats
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DP Table Cells Filled</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c084fc' }}>
                {heistResult.dpCellsComputed}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compute Time</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                {heistResult.dpTimeMs}ms
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <strong>Complexity:</strong> <code>O(n · W)</code> = {heist.rooms.length} rooms × {heist.timeBudget} capacity. Exhaustively fills table before backtracking.
          </div>
        </div>

        {/* Branch & Bound Metrics Card */}
        <div className="glass-panel" style={{ padding: '20px 24px', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <GitBranch size={22} color="#10b981" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#34d399', fontWeight: 700 }}>
              Branch & Bound Efficiency
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nodes Explored</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
                {heistResult.bnbNodesExplored}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Branches Pruned</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>
                {heistResult.prunedCount}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <strong>Empirical Advantage:</strong> Explored only <strong>{heistResult.bnbNodesExplored} nodes</strong> out of theoretical $2^{"{" + heist.rooms.length + "}"} = {Math.pow(2, heist.rooms.length)} states thanks to fractional upper-bound pruning!
          </div>
        </div>

      </div>

      {/* Synchronized Replay Scrubber */}
      <ReplayScrubber
        heist={heist}
        heistResult={heistResult}
        playerActions={playerActions}
        roomMap={roomMap}
      />

      {/* Action Footer */}
      <div style={{ textAlign: 'center', padding: '36px 0 48px' }}>
        <button
          onClick={() => {
            soundFx.playClick();
            onPlayAgain();
          }}
          className="btn-cyber btn-primary animate-pulse-glow"
          style={{ fontSize: '1.15rem', padding: '16px 40px', borderRadius: '14px' }}
        >
          <RotateCcw size={20} />
          <span>INFILTRATE ANOTHER VAULT</span>
        </button>
      </div>
    </div>
  );
};

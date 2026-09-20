import React, { useState, useMemo } from 'react';
import { Heist, HeistResult, PlayerAction, MovementLogEntry, Room } from '../../../shared/types.js';
import { solveGreedyKnapsack } from '../../../shared/algorithms/greedy.js';
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
  Network,
  Lightbulb,
  TrendingUp,
  Zap
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface ResultsScreenProps {
  heist: Heist;
  heistResult: HeistResult;
  playerActions: PlayerAction[];
  playerMovementLog?: MovementLogEntry[];
  onPlayAgain: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  heist,
  heistResult,
  playerActions,
  playerMovementLog = [],
  onPlayAgain
}) => {
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

  // Compute Greedy Knapsack Heuristic baseline
  const greedyResult = useMemo(() => {
    return solveGreedyKnapsack(heist.rooms, heist.timeBudget);
  }, [heist.rooms, heist.timeBudget]);

  const greedyValue = heistResult.greedyValue ?? greedyResult.totalValue;
  const greedyTime = heistResult.greedyTotalTime ?? greedyResult.totalTime;
  const greedyRoomCount = heistResult.greedyPath ? heistResult.greedyPath.length : greedyResult.selectedRoomIds.length;

  const optimalValue = heistResult.optimalValue;
  const ratio = optimalValue > 0 ? (playerTotalValue / optimalValue) : 1;
  const greedyRatio = optimalValue > 0 ? (greedyValue / optimalValue) : 1;

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

  const maxScore = Math.max(optimalValue, playerTotalValue, greedyValue, 1);

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

      {/* 4-Way Score Comparison Scoreboard */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#00f0ff" />
            4-Way Knapsack Algorithm Scoreboard
          </h2>
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Comparing: Player vs Greedy vs DP vs Branch & Bound
          </span>
        </div>

        {/* 1. Player Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🧑 You (Human Operator) {playerValid ? `(${playerActions.length} rooms in ${playerTotalTime}s)` : '(INVALID RUN)'}
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

        {/* 2. Greedy Knapsack Heuristic Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 Greedy Knapsack Heuristic (Sorted by Value/Time Density • {greedyRoomCount} rooms in {greedyTime}s)
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.1rem' }}>
              ${greedyValue}k <span style={{ fontSize: '0.8rem', color: greedyRatio === 1 ? '#10b981' : '#f59e0b' }}>({Math.round(greedyRatio * 100)}% optimal)</span>
            </span>
          </div>
          <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(greedyValue / maxScore) * 100}%`,
              background: 'linear-gradient(90deg, #d97706, #fbbf24)',
              boxShadow: '0 0 12px #fbbf24'
            }} />
          </div>
        </div>

        {/* 3. DP Crew Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🤖 DP Crew (Bottom-Up Dynamic Programming ground truth)
            </span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#c084fc', fontSize: '1.1rem' }}>
              ${optimalValue}k <span style={{ fontSize: '0.8rem', color: '#10b981' }}>(100% Optimal)</span>
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

        {/* 4. Branch & Bound Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Branch & Bound Crew (Best-First Search + Fractional Bound)
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

        {/* Comparative Debrief Callout */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
          marginTop: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          {playerTotalValue > greedyValue ? (
            <span>
              🏆 <strong style={{ color: '#f8fafc' }}>Outsmarted the Greedy Heuristic:</strong> You secured <strong style={{ color: '#00f0ff' }}>${playerTotalValue}k</strong>, beating the Greedy knapsack solver (<strong style={{ color: '#fbbf24' }}>${greedyValue}k</strong>) by <strong style={{ color: '#10b981' }}>+${playerTotalValue - greedyValue}k</strong>! Greedy density sorting was trapped in a local optimum.
            </span>
          ) : playerTotalValue === greedyValue ? (
            <span>
              🤝 <strong style={{ color: '#f8fafc' }}>Matched Greedy Heuristic:</strong> Your score (<strong style={{ color: '#00f0ff' }}>${playerTotalValue}k</strong>) equaled the value-to-cost greedy density baseline (<strong style={{ color: '#fbbf24' }}>${greedyValue}k</strong>).
            </span>
          ) : (
            <span>
              💡 <strong style={{ color: '#f8fafc' }}>Greedy Comparison:</strong> A purely Greedy density strategy achieved <strong style={{ color: '#fbbf24' }}>${greedyValue}k</strong> ({Math.round(greedyRatio * 100)}% optimal) vs your <strong style={{ color: '#00f0ff' }}>${playerTotalValue}k</strong>. Using the Greedy Hint power-up next time can help bridge the gap!
            </span>
          )}
        </div>
      </div>

      {/* CS Efficiency & Complexity 3-Way Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Greedy Heuristic Metrics Card */}
        <div className="glass-panel" style={{ padding: '20px 24px', borderColor: 'rgba(245,158,11,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Lightbulb size={22} color="#fbbf24" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#fbbf24', fontWeight: 700 }}>
              Greedy Heuristic
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approximation Value</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>
                ${greedyValue}k
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Time Complexity</div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                O(n log n)
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <strong>Heuristic Trade-off:</strong> Picks highest value-per-second rooms locally. Blazing fast, but lacks backtracking guarantees (achieved <strong>{Math.round(greedyRatio * 100)}%</strong> optimal).
          </div>
        </div>

        {/* DP Metrics Card */}
        <div className="glass-panel" style={{ padding: '20px 24px', borderColor: 'rgba(168,85,247,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Layers size={22} color="#c084fc" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#c084fc', fontWeight: 700 }}>
              Dynamic Programming
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Table Cells Computed</div>
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
            <strong>Complexity:</strong> <code>O(n · W)</code> = {heist.rooms.length} rooms × {heist.timeBudget}s capacity. Guaranteed global optimum via bottom-up tabulation.
          </div>
        </div>

        {/* Branch & Bound Metrics Card */}
        <div className="glass-panel" style={{ padding: '20px 24px', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <GitBranch size={22} color="#10b981" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#34d399', fontWeight: 700 }}>
              Branch & Bound
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
            <strong>Pruning Advantage:</strong> Explored <strong>{heistResult.bnbNodesExplored} nodes</strong> out of theoretical $2^{"{" + heist.rooms.length + "}"} = {Math.pow(2, heist.rooms.length)} states via fractional knapsack bounds.
          </div>
        </div>

      </div>

      {/* Synchronized Replay Scrubber with 3-Character Arena */}
      <ReplayScrubber
        heist={heist}
        heistResult={heistResult}
        playerActions={playerActions}
        playerMovementLog={playerMovementLog}
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

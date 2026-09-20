import React from 'react';
import { X, Cpu, GitBranch, Zap, Layers, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface AlgorithmExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmExplainer: React.FC<AlgorithmExplainerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.2)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', background: 'rgba(0,240,255,0.15)', borderRadius: '10px', color: '#00f0ff' }}>
            <Cpu size={28} />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.6rem', color: '#f8fafc' }}>
              Knapsack Theory & Algorithm Breakdown
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              How Dynamic Programming and Branch & Bound conquer the 0/1 Knapsack Problem
            </p>
          </div>
        </div>

        {/* 1. Problem Formulation */}
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#00f0ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} /> 0/1 Knapsack Problem Definition
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Given a set of $n$ rooms (items) where room $i$ has loot value $v_i$ and time cost $w_i$, and a maximum heist time budget $W$:
          </p>
          <div className="font-mono" style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 16px', borderRadius: '8px', margin: '10px 0', fontSize: '0.85rem', color: '#38bdf8' }}>
            Maximize ∑ (v_i · x_i) subject to ∑ (w_i · x_i) ≤ W, where x_i ∈ {"{0, 1}"}
          </div>
        </div>

        {/* 2-Column Grid: DP vs BnB */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Dynamic Programming */}
          <div style={{ background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Layers size={22} color="#a855f7" />
              <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#c084fc' }}>
                Bottom-Up Dynamic Programming
              </h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              Constructs a 2D matrix <code style={{ color: '#c084fc' }}>dp[i][w]</code> representing the maximum loot using a subset of the first $i$ rooms with time budget $w$.
            </p>

            <div className="font-mono" style={{ background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#e9d5ff', marginBottom: '12px' }}>
              dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i)
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#f8fafc' }}>Time Complexity:</strong> $O(n \cdot W)$ (pseudo-polynomial)</div>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#f8fafc' }}>Space Complexity:</strong> $O(n \cdot W)$</div>
              <div><strong style={{ color: '#f8fafc' }}>Backtracking:</strong> Reconstructs the exact item set by inspecting state differences from <code style={{ color: '#c084fc' }}>dp[n][W]</code> to <code style={{ color: '#c084fc' }}>dp[0][0]</code>.</div>
            </div>
          </div>

          {/* Branch and Bound */}
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <GitBranch size={22} color="#10b981" />
              <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#34d399' }}>
                Best-First Branch & Bound
              </h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              Builds a decision tree exploring "include" and "exclude" branches, prioritized by an optimistic upper bound heuristic calculated via <strong>Fractional Knapsack</strong>.
            </p>

            <div className="font-mono" style={{ background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#a7f3d0', marginBottom: '12px' }}>
              Bound = Value_so_far + Greedy_Fractional(remaining_items)
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#f8fafc' }}>Pruning Condition 1:</strong> Time Cost &gt; Total Budget (Infeasible)</div>
              <div style={{ marginBottom: '6px' }}><strong style={{ color: '#f8fafc' }}>Pruning Condition 2:</strong> Upper Bound &le; Best Value Found So Far</div>
              <div><strong style={{ color: '#f8fafc' }}>Efficiency:</strong> Explores only a tiny fraction of the $2^n$ state space in practical scenarios!</div>
            </div>
          </div>

        </div>

        {/* 3. Syllabus Connection */}
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '6px', fontWeight: 600 }}>
            <Zap size={18} />
            <span>Why Compare DP with Branch & Bound?</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            While Dynamic Programming fills an entire table of size $n \times W$, Branch & Bound leverages the <strong>Greedy Method</strong> (fractional upper bound) to ruthlessly prune unpromising subtrees. In Time Heist, you can directly compare <code>dpCellsComputed</code> against <code>bnbNodesExplored</code> to see empirical efficiency in real-time!
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-cyber btn-primary">
            Understood, Return to Heist
          </button>
        </div>

      </div>
    </div>
  );
};

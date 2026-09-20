import React from 'react';
import { Clock, ShieldAlert, LogOut, Flame } from 'lucide-react';

interface TimerHeaderProps {
  timeRemaining: number;
  timeBudget: number;
  timeElapsed: number;
  onAbortHeist: () => void;
  isFinished: boolean;
}

export const TimerHeader: React.FC<TimerHeaderProps> = ({
  timeRemaining,
  timeBudget,
  timeElapsed,
  onAbortHeist,
  isFinished
}) => {
  const progressPercent = Math.min(100, Math.max(0, (timeRemaining / timeBudget) * 100));
  const isCritical = timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="glass-panel" style={{
      padding: '16px 24px',
      marginBottom: '20px',
      borderColor: isCritical ? 'rgba(239,68,68,0.5)' : 'var(--border-subtle)',
      boxShadow: isCritical ? '0 0 30px rgba(239,68,68,0.3)' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(0,240,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isCritical ? '#ef4444' : '#00f0ff'
          }}>
            {isCritical ? <Flame size={20} className="animate-pulse-glow" /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: isCritical ? '#ef4444' : '#f8fafc' }}>
              {isFinished ? 'VAULT AIRLOCKS SEALED' : isCritical ? 'CRITICAL: ALARM IMMINENT' : 'VAULT INFILTRATION IN PROGRESS'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Elapsed: <span className="font-mono">{timeElapsed.toFixed(1)}s</span> / {timeBudget}s
            </div>
          </div>
        </div>

        {/* Center: Digital Countdown Display */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Time Remaining
          </div>
          <div className="font-mono" style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            lineHeight: 1,
            color: isCritical ? '#ef4444' : '#00f0ff',
            textShadow: isCritical ? '0 0 16px rgba(239,68,68,0.7)' : '0 0 16px rgba(0,240,255,0.5)'
          }}>
            {Math.max(0, Math.ceil(timeRemaining))}s
          </div>
        </div>

        {/* Right: Emergency Exfiltrate */}
        <div>
          <button
            onClick={onAbortHeist}
            className="btn-cyber btn-danger"
            style={{ fontSize: '0.85rem', padding: '10px 18px' }}
          >
            <LogOut size={16} />
            <span>{isFinished ? 'View Results' : 'Exfiltrate Now'}</span>
          </button>
        </div>

      </div>

      {/* Progress Gauge */}
      <div style={{
        marginTop: '14px',
        width: '100%',
        height: '6px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: isCritical
            ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
            : 'linear-gradient(90deg, #00f0ff, #10b981)',
          transition: 'width 0.1s linear',
          boxShadow: isCritical ? '0 0 12px #ef4444' : '0 0 12px #00f0ff'
        }} />
      </div>
    </div>
  );
};

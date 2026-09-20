import React from 'react';
import { Volume2, VolumeX, ShieldAlert, BookOpen, Sparkles, Terminal } from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface NavbarProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenExplainer: () => void;
  currentScreen: 'setup' | 'live' | 'results';
  onResetToSetup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  setSoundEnabled,
  onOpenExplainer,
  currentScreen,
  onResetToSetup
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    soundFx.enabled = next;
    setSoundEnabled(next);
    if (next) soundFx.playClick();
  };

  return (
    <header className="glass-panel" style={{ margin: '16px auto', maxWidth: '1440px', padding: '12px 24px', borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Logo */}
        <div 
          onClick={currentScreen !== 'setup' ? onResetToSetup : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: currentScreen !== 'setup' ? 'pointer' : 'default' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}>
            <ShieldAlert size={24} color="#07090e" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', color: '#f8fafc' }}>
                TIME <span style={{ color: '#00f0ff', textShadow: '0 0 12px rgba(0,240,255,0.6)' }}>HEIST</span>
              </span>
              <span className="badge" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)', fontSize: '0.65rem' }}>
                0/1 KNAPSACK SHOWDOWN
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Human Operator vs. Bottom-Up DP vs. Best-First Branch & Bound
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenExplainer();
            }}
            className="btn-cyber btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            title="Algorithm Theory & Big-O Guide"
          >
            <BookOpen size={16} color="#00f0ff" />
            <span>Algorithm Guide</span>
          </button>

          <button
            onClick={toggleSound}
            className="btn-cyber btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} color="#94a3b8" />}
          </button>

          {currentScreen !== 'setup' && (
            <button
              onClick={() => {
                soundFx.playClick();
                onResetToSetup();
              }}
              className="btn-cyber btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <Terminal size={16} />
              <span>New Heist</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

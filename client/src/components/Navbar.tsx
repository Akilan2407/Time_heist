import React from 'react';
import { Volume2, VolumeX, BookOpen, Terminal } from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface NavbarProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenExplainer: () => void;
  currentScreen: 'landing' | 'setup' | 'live' | 'results';
  onResetToSetup: () => void;
  onGoToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  setSoundEnabled,
  onOpenExplainer,
  currentScreen,
  onResetToSetup,
  onGoToLanding
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    soundFx.enabled = next;
    setSoundEnabled(next);
    if (next) soundFx.playClick();
  };

  const handleBrandClick = () => {
    if (onGoToLanding) {
      soundFx.playClick();
      onGoToLanding();
    } else {
      onResetToSetup();
    }
  };

  return (
    <header style={{
      margin: 0,
      background: 'linear-gradient(180deg, rgba(10,2,3,0.98) 0%, rgba(18,4,6,0.96) 100%)',
      borderBottom: '1px solid rgba(230,57,70,0.25)',
      boxShadow: '0 4px 40px rgba(193,18,31,0.25), 0 1px 0 rgba(255,215,0,0.08)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Red-gold signature stripe */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #7b0d12 0%, #c1121f 20%, #e63946 40%, #ffd700 50%, #e63946 60%, #c1121f 80%, #7b0d12 100%)',
      }} />

      <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '11px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>

        {/* Brand */}
        <div
          onClick={handleBrandClick}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(193,18,31,0.6) 0%, rgba(123,13,18,0.8) 100%)',
            border: '1.5px solid rgba(230,57,70,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(230,57,70,0.45), inset 0 0 12px rgba(0,0,0,0.5)',
            fontSize: '1.5rem', position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ filter: 'drop-shadow(0 0 6px rgba(230,57,70,0.9))' }}>🎭</span>
            <div className="scanline-effect" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="font-hero" style={{
                fontSize: '1.75rem', letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, #ffd700 0%, #e63946 45%, #ffd700 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                TIME HEIST
              </span>
              <span style={{
                background: 'rgba(193,18,31,0.22)', border: '1px solid rgba(230,57,70,0.45)',
                color: '#f87171', borderRadius: '9999px', padding: '2px 10px',
                fontSize: '0.62rem', fontFamily: 'var(--font-title)',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                🎭 LA CASA DE PAPEL
              </span>
            </div>
            <div className="font-display" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: '1px' }}>
              THE PROFESSOR vs. BERLIN's DP vs. TOKYO's B&B · KNAPSACK OPERATION
            </div>
          </div>
        </div>

        {/* Screen indicator dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {(['landing', 'setup', 'live', 'results'] as const).map((s) => (
            <div key={s} style={{
              height: '5px', width: currentScreen === s ? '26px' : '7px',
              borderRadius: '3px',
              background: currentScreen === s ? 'linear-gradient(90deg, #e63946, #ffd700)' : 'rgba(230,57,70,0.18)',
              transition: 'all 0.35s ease',
            }} />
          ))}
          <span className="font-display" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginLeft: '6px', textTransform: 'uppercase' }}>
            {currentScreen === 'landing' ? 'HQ RECEPTION' : currentScreen === 'setup' ? 'MISSION BRIEF' : currentScreen === 'live' ? 'OPERATION LIVE' : 'DEBRIEF'}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => { soundFx.playClick(); onOpenExplainer(); }} className="btn-cyber btn-secondary" style={{ fontSize: '0.78rem', padding: '8px 14px' }}>
            <BookOpen size={15} color="#ffd700" /><span>Algorithm Guide</span>
          </button>
          <button onClick={toggleSound} className="btn-cyber btn-secondary" style={{ fontSize: '0.78rem', padding: '8px 12px' }}>
            {soundEnabled ? <Volume2 size={15} color="#4ade80" /> : <VolumeX size={15} color="#7a5458" />}
          </button>
          {currentScreen !== 'landing' && (
            <button onClick={() => { soundFx.playClick(); handleBrandClick(); }} className="btn-cyber" style={{ fontSize: '0.78rem', padding: '8px 16px', background: 'rgba(193,18,31,0.2)', border: '1px solid rgba(230,57,70,0.4)', color: '#f87171' }}>
              <Terminal size={15} /><span>New Operation</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { CharacterStatus } from '../../shared/types.js';
import { Zap, Sparkles, Lock, ShieldCheck } from 'lucide-react';

export interface CharacterProps {
  x: number;
  y: number;
  status: CharacterStatus;
  variant?: 'player' | 'dp' | 'bnb';
  facing?: 'left' | 'right';
  name?: string;
  transitionDuration?: number; // seconds
  showLabel?: boolean;
}

export const Character: React.FC<CharacterProps> = ({
  x,
  y,
  status,
  variant = 'player',
  facing = 'right',
  name,
  transitionDuration = 0.5,
  showLabel = true
}) => {
  const getThemeColor = () => {
    switch (variant) {
      case 'dp':
        return { primary: '#a855f7', glow: 'rgba(168,85,247,0.5)', tag: 'DP' };
      case 'bnb':
        return { primary: '#10b981', glow: 'rgba(16,185,129,0.5)', tag: 'B&B' };
      default:
        return { primary: '#00f0ff', glow: 'rgba(0,240,255,0.5)', tag: 'YOU' };
    }
  };

  const theme = getThemeColor();
  const isRunning = status === 'running';
  const isLooting = status === 'looting';

  const animationClass = isRunning
    ? 'character-sprite-running'
    : isLooting
    ? 'character-sprite-looting'
    : 'character-sprite-idle';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: isRunning && transitionDuration > 0
          ? `transform ${transitionDuration}s cubic-bezier(0.2, 0.8, 0.4, 1)`
          : 'none',
        pointerEvents: 'none',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transformOrigin: 'bottom center',
        marginLeft: '-22px', // Center offset (44px width / 2)
        marginTop: '-36px'   // Bottom-anchored offset
      }}
    >
      {/* Label Badge */}
      {showLabel && (
        <div
          className="font-mono"
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(5, 10, 20, 0.85)',
            border: `1px solid ${theme.primary}`,
            color: theme.primary,
            boxShadow: `0 0 8px ${theme.glow}`,
            marginBottom: '3px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em'
          }}
        >
          {name || theme.tag}
          {isLooting && ' [HACKING]'}
          {isRunning && ' [SPRINT]'}
        </div>
      )}

      {/* Electrical Sparks on Looting */}
      {isLooting && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            color: '#f59e0b',
            animation: 'radar-ping 0.8s ease-out infinite'
          }}
        >
          <Zap size={18} fill="#f59e0b" />
        </div>
      )}

      {/* Character Sprite Graphic */}
      <div
        className={animationClass}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${theme.primary} 60%, #050a14 100%)`,
          boxShadow: `0 0 16px ${theme.glow}, inset 0 0 6px rgba(0,0,0,0.8)`,
          border: `2px solid ${theme.primary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          position: 'relative'
        }}
      >
        {/* Visor / Cybernetic Face */}
        <div
          style={{
            width: '18px',
            height: '6px',
            borderRadius: '3px',
            background: '#ffffff',
            boxShadow: `0 0 8px #ffffff`,
            position: 'absolute',
            top: '12px',
            right: facing === 'right' ? '6px' : '14px'
          }}
        />

        {/* State Icon Indicator */}
        <div style={{ marginTop: '8px', color: '#050a14' }}>
          {isLooting ? (
            <Sparkles size={14} fill="#f59e0b" color="#f59e0b" />
          ) : isRunning ? (
            <Zap size={14} fill="#050a14" color="#050a14" />
          ) : (
            <Lock size={12} color="#050a14" />
          )}
        </div>
      </div>

      {/* Shadow Footprint */}
      <div
        style={{
          width: '28px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.5)',
          filter: 'blur(2px)',
          marginTop: '-2px'
        }}
      />
    </div>
  );
};

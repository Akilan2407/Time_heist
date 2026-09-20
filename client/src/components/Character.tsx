import React, { useState, useEffect } from 'react';
import { CharacterStatus } from '../../../shared/types.js';
import { Zap, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import runboyImg from '../assets/runboy.png';
import { removeWhiteBackground } from '../utils/imageUtils.js';

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
  const [spriteSrc, setSpriteSrc] = useState<string>(runboyImg);

  useEffect(() => {
    removeWhiteBackground(runboyImg).then((transparentUrl) => {
      setSpriteSrc(transparentUrl);
    });
  }, []);

  const getThemeColor = () => {
    switch (variant) {
      case 'dp':
        return {
          primary: '#a855f7',
          glow: 'rgba(168,85,247,0.7)',
          tag: 'DP CREW',
          filter: 'hue-rotate(240deg) saturate(1.4) drop-shadow(0 0 10px rgba(168,85,247,0.8))'
        };
      case 'bnb':
        return {
          primary: '#10b981',
          glow: 'rgba(16,185,129,0.7)',
          tag: 'B&B CREW',
          filter: 'hue-rotate(90deg) saturate(1.4) drop-shadow(0 0 10px rgba(16,185,129,0.8))'
        };
      default:
        return {
          primary: '#00f0ff',
          glow: 'rgba(0,240,255,0.8)',
          tag: 'OPERATOR',
          filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.85))'
        };
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
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transformOrigin: 'bottom center',
        marginLeft: '-35px', // Center offset (70px width / 2)
        marginTop: '-72px'   // Bottom-anchored offset
      }}
    >
      {/* Label Badge */}
      {showLabel && (
        <div
          className="font-mono"
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(5, 10, 20, 0.92)',
            border: `1px solid ${theme.primary}`,
            color: theme.primary,
            boxShadow: `0 0 12px ${theme.glow}`,
            marginBottom: '4px',
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
            top: '-16px',
            color: '#f59e0b',
            animation: 'radar-ping 0.8s ease-out infinite'
          }}
        >
          <Zap size={24} fill="#f59e0b" />
        </div>
      )}

      {/* Running Boy Character Sprite (Enlarged & Transparent) */}
      <div
        className={animationClass}
        style={{
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          position: 'relative'
        }}
      >
        <img
          src={spriteSrc}
          alt="Running character"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: theme.filter,
            imageRendering: 'auto'
          }}
        />

        {/* Action Status Indicator Icon */}
        {isLooting && (
          <div
            style={{
              position: 'absolute',
              right: '-6px',
              bottom: '4px',
              background: 'rgba(5, 10, 20, 0.95)',
              borderRadius: '50%',
              padding: '3px',
              border: '1.5px solid #f59e0b',
              boxShadow: '0 0 10px #f59e0b',
              display: 'flex'
            }}
          >
            <Sparkles size={14} color="#f59e0b" fill="#f59e0b" />
          </div>
        )}
      </div>

      {/* Ground Shadow */}
      <div
        style={{
          width: '42px',
          height: '8px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.65)',
          boxShadow: `0 0 10px ${theme.glow}`,
          filter: 'blur(2px)',
          marginTop: '-6px'
        }}
      />
    </div>
  );
};

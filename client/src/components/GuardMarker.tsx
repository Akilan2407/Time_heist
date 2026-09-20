import React from 'react';
import { ShieldAlert, Eye, Radio, AlertTriangle } from 'lucide-react';

export interface GuardMarkerProps {
  x: number;
  y: number;
  color?: string;
  name?: string;
  status: 'patrolling' | 'inspecting';
  facing?: 'left' | 'right';
  showLabel?: boolean;
}

export const GuardMarker: React.FC<GuardMarkerProps> = ({
  x,
  y,
  color = '#ef4444',
  name = 'SENTRY DRONE',
  status,
  facing = 'right',
  showLabel = true
}) => {
  const isInspecting = status === 'inspecting';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        pointerEvents: 'none',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transformOrigin: 'bottom center',
        marginLeft: '-24px', // (48px / 2)
        marginTop: '-52px'
      }}
    >
      {/* Guard Name Label */}
      {showLabel && (
        <div
          className="font-mono"
          style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(20, 5, 8, 0.92)',
            border: `1px solid ${color}`,
            color: color,
            boxShadow: `0 0 10px ${color}88`,
            marginBottom: '3px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Radio size={10} className="animate-pulse-glow" />
          {name}
          {isInspecting ? ' [SCANNING]' : ' [PATROL]'}
        </div>
      )}

      {/* Rotating Security Searchlight Cone when Inspecting */}
      {isInspecting && (
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}33 0%, ${color}00 70%)`,
            border: `1.5px dashed ${color}aa`,
            animation: 'guard-search-rotate 3s linear infinite',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Sentry Drone Hull */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 55%, #180508 100%)`,
          boxShadow: `0 0 20px ${color}, inset 0 0 6px rgba(0,0,0,0.9)`,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          animation: 'idle-breathe 1.8s ease-in-out infinite'
        }}
      >
        {/* Flashing Top Siren Light */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            width: '10px',
            height: '6px',
            borderRadius: '3px',
            background: '#ffffff',
            boxShadow: `0 0 12px ${color}, 0 0 4px #ffffff`,
            animation: 'pulseGlow 0.6s infinite ease-in-out'
          }}
        />

        {/* Central Sentry Optical Eye */}
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#050a14',
            border: `1.5px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.9)'
          }}
        >
          <Eye size={10} color={color} />
        </div>
      </div>

      {/* Sentry Ground Scanner Shadow */}
      <div
        style={{
          width: '28px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.65)',
          boxShadow: `0 0 8px ${color}66`,
          filter: 'blur(1.5px)',
          marginTop: '-3px'
        }}
      />
    </div>
  );
};

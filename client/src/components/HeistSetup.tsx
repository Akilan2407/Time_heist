import React, { useState } from 'react';
import { Heist, Room } from '../../../shared/types.js';
import { 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Sliders, 
  Crosshair, 
  TrendingUp, 
  Lock, 
  Sparkles,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

interface HeistSetupProps {
  heist: Heist;
  onGenerateNew: (options: {
    roomCount?: number;
    timeBudget?: number;
    vaultPotential?: number;
    difficulty?: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible' | 'Custom';
  }) => void;
  onStartHeist: () => void;
  isLoading: boolean;
}

export const HeistSetup: React.FC<HeistSetupProps> = ({
  heist,
  onGenerateNew,
  onStartHeist,
  isLoading
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Rookie' | 'Standard' | 'Mastermind' | 'Impossible' | 'Custom'>(heist.difficulty);
  const [showCustom, setShowCustom] = useState(heist.difficulty === 'Custom');
  
  const totalVaultValue = heist.rooms.reduce((sum, r) => sum + r.value, 0);
  const totalVaultTime = heist.rooms.reduce((sum, r) => sum + r.timeCost, 0);

  const [customRooms, setCustomRooms] = useState(heist.rooms.length || 8);
  const [customBudget, setCustomBudget] = useState(heist.timeBudget || 45);
  const [customPotential, setCustomPotential] = useState(totalVaultValue || 650);

  const handleDifficultyChange = (diff: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible') => {
    soundFx.playClick();
    setSelectedDifficulty(diff);
    setShowCustom(false);
    onGenerateNew({ difficulty: diff });
  };

  const handleCustomApply = () => {
    soundFx.playClick();
    setSelectedDifficulty('Custom');
    onGenerateNew({
      roomCount: customRooms,
      timeBudget: customBudget,
      vaultPotential: customPotential,
      difficulty: 'Custom'
    });
  };

  const getSecurityColor = (sec?: string) => {
    switch (sec) {
      case 'Extreme': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#38bdf8';
      default: return '#10b981';
    }
  };

  const avgRoomValue = Math.round(customPotential / Math.max(1, customRooms));
  const avgRoomTime = (customBudget / Math.max(1, customRooms)).toFixed(1);
  const valueDensity = (customPotential / Math.max(1, customBudget)).toFixed(1);

  return (
    <div className="layout-container">
      {/* Top Banner / Mission Title */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div className="scanline-effect" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-player">MISSION BRIEFING</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                SEC-ID: {heist.id.substring(0, 14)}
              </span>
              {heist.difficulty === 'Custom' && (
                <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}>
                  CUSTOM HEIST ARCHITECTURE
                </span>
              )}
            </div>
            <h1 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
              {heist.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '4px' }}>
              Infiltrate the high-security vault. Race against the <strong style={{ color: '#c084fc' }}>DP Crew</strong> and <strong style={{ color: '#34d399' }}>Branch & Bound AI</strong> to loot maximum value before the alarm shuts down all exits.
            </p>
          </div>

          {/* Quick Mission Stats */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Budget</div>
              <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00f0ff' }}>
                {heist.timeBudget}s
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Rooms</div>
              <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {heist.rooms.length}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vault Potential</div>
              <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>
                ₹{totalVaultValue}k
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Preset Selector & Custom Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { key: 'Rookie', label: 'Rookie Job', desc: '5 Rooms • 25s Budget', color: '#10b981' },
          { key: 'Standard', label: 'Bank Job', desc: '8 Rooms • 42s Budget', color: '#38bdf8' },
          { key: 'Mastermind', label: 'Cyber Heist', desc: '12 Rooms • 60s Budget', color: '#a855f7' },
          { key: 'Impossible', label: 'Fort Knox', desc: '16 Rooms • 80s Budget', color: '#ef4444' }
        ].map((item) => {
          const isSelected = !showCustom && selectedDifficulty === item.key;
          return (
            <div
              key={item.key}
              onClick={() => handleDifficultyChange(item.key as any)}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                borderColor: isSelected ? item.color : 'var(--border-subtle)',
                boxShadow: isSelected ? `0 0 20px ${item.color}33` : 'none',
                background: isSelected ? 'rgba(255,255,255,0.06)' : 'var(--bg-card)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="font-display" style={{ fontWeight: 700, color: isSelected ? item.color : '#f8fafc', fontSize: '1.05rem' }}>
                  {item.label}
                </span>
                {isSelected && <Sparkles size={16} color={item.color} />}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          );
        })}

        {/* Custom Button */}
        <div
          onClick={() => {
            soundFx.playClick();
            setShowCustom(!showCustom);
          }}
          className="glass-panel"
          style={{
            padding: '16px 20px',
            cursor: 'pointer',
            borderColor: showCustom ? '#f59e0b' : 'var(--border-subtle)',
            boxShadow: showCustom ? '0 0 20px rgba(245,158,11,0.25)' : 'none',
            background: showCustom ? 'rgba(245,158,11,0.08)' : 'var(--bg-card)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="font-display" style={{ fontWeight: 700, color: showCustom ? '#f59e0b' : '#f8fafc', fontSize: '1.05rem' }}>
              Custom Heist Architect
            </span>
            <Sliders size={16} color={showCustom ? '#f59e0b' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fix Rooms, Potential & Time</div>
        </div>
      </div>

      {/* Custom Heist Configuration Panel */}
      {showCustom && (
        <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px', border: '1.5px solid rgba(245,158,11,0.4)', background: 'rgba(15, 20, 32, 0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="#f59e0b" />
                Custom Heist Parameter Controls
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Dial in the exact vault room count, total loot value potential, and mission countdown budget.
              </div>
            </div>
            
            {/* Live Telemetry Pill */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem' }}>
              <span>Avg Room: <strong style={{ color: '#f59e0b' }}>${avgRoomValue}k</strong></span>
              <span>•</span>
              <span>Avg Pace: <strong style={{ color: '#00f0ff' }}>{avgRoomTime}s/room</strong></span>
              <span>•</span>
              <span>Density: <strong style={{ color: '#10b981' }}>{valueDensity}k/s</strong></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '22px' }}>
            
            {/* Control 1: Room Count */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} color="#f59e0b" /> Number of Rooms
                </span>
                <input
                  type="number"
                  min={3}
                  max={18}
                  value={customRooms}
                  onChange={(e) => setCustomRooms(Math.max(3, Math.min(18, Number(e.target.value) || 3)))}
                  className="font-mono"
                  style={{
                    width: '64px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    fontWeight: 700,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    textAlign: 'center',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <input
                type="range"
                min={3}
                max={18}
                value={customRooms}
                onChange={(e) => setCustomRooms(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>3 Rooms (Quick)</span>
                <span>10 Rooms (Balanced)</span>
                <span>18 Rooms (Epic)</span>
              </div>
            </div>

            {/* Control 2: Vault Potential (₹k) */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={15} color="#f59e0b" /> Vault Potential (₹k)
                </span>
                <input
                  type="number"
                  min={50}
                  max={3000}
                  step={25}
                  value={customPotential}
                  onChange={(e) => setCustomPotential(Math.max(50, Math.min(3000, Number(e.target.value) || 50)))}
                  className="font-mono"
                  style={{
                    width: '84px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    fontWeight: 700,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    textAlign: 'center',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <input
                type="range"
                min={50}
                max={3000}
                step={25}
                value={customPotential}
                onChange={(e) => setCustomPotential(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>$50k (Small)</span>
                <span>$1,000k (High Roller)</span>
                <span>$3,000k (Jackpot)</span>
              </div>
            </div>

            {/* Control 3: Time Budget (s) */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#00f0ff" /> Time Budget (Seconds)
                </span>
                <input
                  type="number"
                  min={10}
                  max={150}
                  step={1}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(Math.max(10, Math.min(150, Number(e.target.value) || 10)))}
                  className="font-mono"
                  style={{
                    width: '68px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid #00f0ff',
                    color: '#00f0ff',
                    fontWeight: 700,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    textAlign: 'center',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={1}
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>10s (Blitz)</span>
                <span>50s (Standard)</span>
                <span>150s (Marathon)</span>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCustomApply}
              disabled={isLoading}
              className="btn-cyber btn-accent-gold animate-pulse-glow"
              style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: '10px' }}
            >
              <RotateCcw size={16} /> GENERATE CUSTOM HEIST
            </button>
          </div>
        </div>
      )}

      {/* Vault Blueprint: Room Cards Preview */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="font-display" style={{ fontSize: '1.3rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={20} color="#00f0ff" />
            Vault Blueprints & Target Sectors
          </h2>
          <button
            onClick={() => {
              soundFx.playClick();
              onGenerateNew({ difficulty: selectedDifficulty });
            }}
            className="btn-cyber btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RotateCcw size={14} /> Re-roll Targets
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {heist.rooms.map((room, idx) => {
            const ratio = (room.value / room.timeCost).toFixed(1);
            return (
              <div
                key={room.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  background: 'rgba(15, 22, 36, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                    <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {room.name}
                    </h3>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: `${getSecurityColor(room.securityLevel)}22`,
                      color: getSecurityColor(room.securityLevel),
                      border: `1px solid ${getSecurityColor(room.securityLevel)}55`,
                      fontSize: '0.65rem'
                    }}
                  >
                    {room.securityLevel || 'Secure'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', minHeight: '36px', lineHeight: '1.4' }}>
                  {room.description || 'Target chamber with automated alarms.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loot Value</div>
                    <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
                      ₹{room.value}k
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loot Time</div>
                    <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00f0ff' }}>
                      {room.timeCost}s
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Efficiency</div>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                      ₹{ratio}k/s
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer: START HEIST */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <button
          onClick={() => {
            soundFx.playLootSuccess();
            onStartHeist();
          }}
          disabled={isLoading}
          className="btn-cyber btn-primary animate-pulse-glow"
          style={{ fontSize: '1.25rem', padding: '18px 48px', borderRadius: '16px' }}
        >
          <Play size={24} fill="#050a14" />
          <span>LAUNCH HEIST OPERATION</span>
        </button>
      </div>
    </div>
  );
};

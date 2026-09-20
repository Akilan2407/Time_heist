import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  GitBranch, 
  ChevronRight, 
  Volume2, 
  HelpCircle, 
  Flame, 
  Zap, 
  Clock, 
  Coins, 
  Eye, 
  RotateCw, 
  MessageSquare,
  Award,
  Crosshair,
  Sliders
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';
import toyMascotImg from '../assets/heist_mascot_toy.jpg';

interface LandingPageProps {
  onStartGame: () => void;
  onOpenExplainer: () => void;
}

interface Quote {
  text: string;
  character: string;
  role: string;
  icon: string;
  badgeColor: string;
}

const MONEY_HEIST_QUOTES: Quote[] = [
  {
    text: "In this world, everything is governed by balance: there's what you stand to gain and what you stand to lose. Calculate every millisecond.",
    character: "The Professor (Sergio Marquina)",
    role: "Architect of the Heist",
    icon: "🎭",
    badgeColor: "#ffd700"
  },
  {
    text: "Time is greater than gold. In the vault, every room you skip or breach defines whether you walk away legends or prisoners.",
    character: "Berlin (Andrés de Fonollosa)",
    role: "Field Commander",
    icon: "👑",
    badgeColor: "#e63946"
  },
  {
    text: "First times are special. Unique. But the last times... have no comparison. Plan your path down to the microsecond.",
    character: "Tokyo (Silene Oliveira)",
    role: "Vanguard Infiltrator",
    icon: "⚡",
    badgeColor: "#a8b2bd"
  },
  {
    text: "Let the matriarchy begin! Fill those bags with maximum value before the alarm sirens ring down the steel blast doors.",
    character: "Nairobi (Ágata Jiménez)",
    role: "Master of Coin",
    icon: "💰",
    badgeColor: "#10b981"
  },
  {
    text: "Stick to the plan. Let the Dynamic Programming table calculate the optimum, but let the human mastermind claim the glory.",
    character: "The Professor's Rulebook",
    role: "Algorithmic Doctrine",
    icon: "🧠",
    badgeColor: "#c084fc"
  }
];

const TOY_MESSAGES = [
  "Hola, Mastermind! 🎭 Click me for tactical heist intel!",
  "Stick to the plan! We have 0/1 knapsack vaults waiting for us!",
  "Bella Ciao! 🎶 Tokyo and Berlin are already prepping their algorithms.",
  "Remember: 1 second wasted is ₹50k lost! Choose your route wisely.",
  "Guard drones patrol the corridors. Scout rooms before breaching!",
  "Ready to outsmart Dynamic Programming? Click START GAME below!"
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onOpenExplainer
}) => {
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [toySpeechIdx, setToySpeechIdx] = useState(0);
  const [toyClicked, setToyClicked] = useState(false);
  const [toyHeartbeat, setToyHeartbeat] = useState(false);

  // Auto-rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % MONEY_HEIST_QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleToyClick = () => {
    soundFx.playClick();
    setToyClicked(true);
    setToyHeartbeat(true);
    setToySpeechIdx((prev) => (prev + 1) % TOY_MESSAGES.length);
    setTimeout(() => setToyHeartbeat(false), 600);
  };

  const handleStart = () => {
    soundFx.playLootSuccess();
    onStartGame();
  };

  const currentQuote = MONEY_HEIST_QUOTES[currentQuoteIdx];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 75px)', padding: '24px 20px 60px' }}>
      
      {/* Background Animated Laser Sweep */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '25%', left: '-10%', width: '120%', height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(230,57,70,0.8) 50%, transparent 100%)',
          boxShadow: '0 0 15px rgba(230,57,70,0.9), 0 0 30px rgba(230,57,70,0.5)',
          transform: 'rotate(-4deg)',
          animation: 'scanline 7s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          top: '70%', left: '-10%', width: '120%', height: '1.5px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.6) 50%, transparent 100%)',
          boxShadow: '0 0 12px rgba(255,215,0,0.7)',
          transform: 'rotate(3deg)',
          animation: 'scanline 9s ease-in-out infinite alternate-reverse'
        }} />
      </div>

      <div className="layout-container" style={{ position: 'relative', zIndex: 1, maxWidth: '1380px' }}>
        
        {/* Top Hero Banner Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center',
          marginBottom: '48px',
          padding: '28px 0'
        }}>
          
          {/* Left Column: Mission Brief & Start CTA */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className="dali-mask-badge">
                🎭 LA CASA DE PAPEL
              </span>
              <span className="badge" style={{
                background: 'rgba(255,215,0,0.15)',
                color: '#ffd700',
                border: '1px solid rgba(255,215,0,0.4)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.06em'
              }}>
                ⚡ 0/1 KNAPSACK ALGORITHM GAME
              </span>
              <span className="badge" style={{
                background: 'rgba(230,57,70,0.15)',
                color: '#ff6b6b',
                border: '1px solid rgba(230,57,70,0.4)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}>
                ₹ REAL-TIME VAULT RAID
              </span>
            </div>

            <h1 className="heist-hero-title" style={{
              fontSize: 'clamp(3rem, 6vw, 4.8rem)',
              lineHeight: 0.95,
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              TIME HEIST
            </h1>
            <div className="font-title" style={{
              fontSize: '1.25rem',
              color: '#ffd700',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '14px',
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(255,215,0,0.3)'
            }}>
              THE PROFESSOR'S ROYAL MINT OPERATION
            </div>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              marginBottom: '28px',
              maxWidth: '620px'
            }}>
              Infiltrate high-security algorithmic vaults in real-time. Race your human strategy against 
              <strong style={{ color: '#c084fc' }}> Berlin's Dynamic Programming Tabulation</strong> and 
              <strong style={{ color: '#34d399' }}> Tokyo's Branch & Bound Pruning Engine</strong> to loot maximum value in Indian Rupees before the countdown alarm seals the steel blast doors!
            </p>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              <button
                onClick={handleStart}
                className="btn-cyber btn-primary animate-pulse-glow"
                style={{
                  padding: '16px 36px',
                  fontSize: '1.25rem',
                  borderRadius: '14px',
                  boxShadow: '0 0 35px rgba(230,57,70,0.85), 0 0 70px rgba(230,57,70,0.35)',
                  cursor: 'pointer'
                }}
              >
                <Play size={22} fill="#ffffff" />
                <span className="font-hero" style={{ fontSize: '1.5rem', letterSpacing: '0.08em' }}>
                  START GAME · ENTER VAULT
                </span>
                <ChevronRight size={22} />
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenExplainer();
                }}
                className="btn-cyber btn-secondary"
                style={{
                  padding: '16px 24px',
                  fontSize: '0.95rem',
                  borderRadius: '14px',
                  borderColor: 'rgba(255,215,0,0.4)',
                  color: '#ffd700'
                }}
              >
                <HelpCircle size={18} color="#ffd700" />
                <span className="font-display">ALGORITHM DOSSIER</span>
              </button>
            </div>

            {/* Mini Features Pills */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#00f0ff" />
                <span>100ms Precision Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={16} color="#ffd700" />
                <span>₹3,000k+ Loot Architecture</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} color="#a855f7" />
                <span>Custom Heist Builder</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Money Heist Toy Mascot with Interactive Welcome Bubble */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            
            {/* Mascot Interactive Speech Bubble */}
            <div
              onClick={handleToyClick}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(35,8,12,0.95) 0%, rgba(20,4,6,0.95) 100%)',
                border: '1.5px solid rgba(255,215,0,0.6)',
                borderRadius: '18px',
                padding: '14px 20px',
                maxWidth: '380px',
                marginBottom: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'slide-in-down 0.5s ease-out forwards',
                userSelect: 'none'
              }}
              title="Click the toy or speech bubble for new messages!"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎭</span>
                <span className="font-display" style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#ffd700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  TOY PROFESSOR · HEIST MASCOT
                </span>
                <span className="badge badge-player" style={{ marginLeft: 'auto', fontSize: '0.58rem', padding: '1px 6px' }}>
                  CLICK TO CHAT
                </span>
              </div>
              
              <div style={{
                fontSize: '0.92rem',
                color: '#fff5f5',
                lineHeight: '1.45',
                fontWeight: 500
              }}>
                "{TOY_MESSAGES[toySpeechIdx]}"
              </div>

              {/* Speech Bubble Arrow pointing to toy below */}
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid rgba(255,215,0,0.7)'
              }} />
            </div>

            {/* Toy Figurine Frame with Glowing Cyber Hologram Ring */}
            <div
              onClick={handleToyClick}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '24px',
                padding: '10px',
                background: 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(255,215,0,0.12) 100%)',
                border: '2px solid rgba(230,57,70,0.5)',
                boxShadow: toyHeartbeat
                  ? '0 0 60px rgba(255,215,0,0.8), 0 0 100px rgba(230,57,70,0.6)'
                  : '0 0 35px rgba(230,57,70,0.35), 0 16px 40px rgba(0,0,0,0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: toyHeartbeat ? 'scale(1.05)' : 'scale(1)',
                animation: 'mask-float 6s ease-in-out infinite'
              }}
            >
              {/* Scanline Effect Overlay */}
              <div className="scanline-effect" />

              <img
                src={toyMascotImg}
                alt="Money Heist Toy Mascot"
                style={{
                  width: '320px',
                  height: '320px',
                  objectFit: 'cover',
                  borderRadius: '18px',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(1.02)'
                }}
              />

              {/* Live Greeting Badge overlay at bottom of mascot */}
              <div style={{
                position: 'absolute',
                bottom: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, rgba(10,2,3,0.92) 0%, rgba(35,6,8,0.92) 100%)',
                border: '1px solid rgba(255,215,0,0.7)',
                borderRadius: '9999px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 12px rgba(255,215,0,0.35)',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '1rem' }}>👋</span>
                <span className="font-display" style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 700, letterSpacing: '0.06em' }}>
                  WELCOME, OPERATOR!
                </span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block'
                }} />
              </div>
            </div>

            <div style={{
              marginTop: '12px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>
              🎭 Tap mascot for secret heist tactics • 100% Bella Ciao Vibe
            </div>

          </div>

        </div>

        {/* ─── Money Heist Signature Quotes Showcase ─── */}
        <div className="glass-panel" style={{
          padding: '24px 32px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(230,57,70,0.3)',
          background: 'linear-gradient(135deg, rgba(20,4,6,0.9) 0%, rgba(30,6,9,0.85) 100%)'
        }}>
          <div className="heist-stripe" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>📜</span>
              <h2 className="font-title" style={{ fontSize: '1.2rem', color: '#ffd700', margin: 0, letterSpacing: '0.08em' }}>
                MONEY HEIST · STRATEGIC MAXIMS
              </h2>
            </div>

            {/* Quote Selector Dots & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {MONEY_HEIST_QUOTES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentQuoteIdx(idx);
                  }}
                  style={{
                    width: idx === currentQuoteIdx ? '28px' : '9px',
                    height: '9px',
                    borderRadius: '9999px',
                    background: idx === currentQuoteIdx ? q.badgeColor : 'rgba(255,255,255,0.18)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: idx === currentQuoteIdx ? `0 0 10px ${q.badgeColor}` : undefined
                  }}
                  title={q.character}
                />
              ))}
            </div>
          </div>

          {/* Active Quote Display */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <blockquote style={{
              fontSize: '1.15rem',
              fontStyle: 'italic',
              color: '#f8fafc',
              lineHeight: 1.5,
              margin: '0 0 12px 0',
              fontFamily: 'var(--font-body)'
            }}>
              "{currentQuote.text}"
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>{currentQuote.icon}</span>
              <span className="font-display" style={{ fontWeight: 700, color: currentQuote.badgeColor, fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                {currentQuote.character}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {currentQuote.role}
              </span>
            </div>
          </div>
        </div>

        {/* ─── 3 Gaming Platform Pillars / Features ─── */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="badge badge-player" style={{ marginBottom: '8px' }}>
              CORE GAMEPLAY MECHANICS
            </span>
            <h2 className="font-hero" style={{ fontSize: '2.4rem', letterSpacing: '0.08em', color: '#f8fafc' }}>
              THREE WAYS TO INFILTRATE THE VAULT
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              Experience high-stakes algorithmic optimization through immersive interactive gaming mechanics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
            
            {/* Pillar 1: Human Operator (The Professor) */}
            <div className="glass-panel glass-panel-glow-player" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: 'rgba(230,57,70,0.2)', border: '1px solid rgba(230,57,70,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  🎭
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#ff6b6b', fontWeight: 700 }}>
                    The Human Mastermind
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-Time Infiltration</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                Navigate through 2D blueprint security conduits with fog-of-war. Deploy <strong>Scout Drones</strong> to reveal hidden room loot, dodge <strong>Sentry Drones</strong>, and trigger <strong>Greedy Knapsack Hints</strong>.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(230,57,70,0.15)', color: '#ff6b6b' }}>Fog of War</span>
                <span className="badge" style={{ background: 'rgba(230,57,70,0.15)', color: '#ff6b6b' }}>Sentry Patrols</span>
                <span className="badge" style={{ background: 'rgba(230,57,70,0.15)', color: '#ff6b6b' }}>Scout Drones</span>
              </div>
            </div>

            {/* Pillar 2: Berlin's DP Crew */}
            <div className="glass-panel glass-panel-glow-dp" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  🤖
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#ffd700', fontWeight: 700 }}>
                    Berlin's DP Crew
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bottom-Up Tabulation Engine</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                Executes the mathematically proven 0/1 knapsack optimal solution. Watch the DP state machine lock in high-value targets step-by-step with <code>O(n · W)</code> computational precision.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge badge-dp">100% Optimal</span>
                <span className="badge badge-dp">DP Table Cells</span>
                <span className="badge badge-dp">Precomputed Plan</span>
              </div>
            </div>

            {/* Pillar 3: Tokyo's B&B Squad */}
            <div className="glass-panel glass-panel-glow-bnb" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: 'rgba(168,178,189,0.2)', border: '1px solid rgba(168,178,189,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  ⚡
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#d1d9e0', fontWeight: 700 }}>
                    Tokyo's B&B Squad
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Branch & Bound Search Tree</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                Renders a live interactive state-space search tree. Observe real-time branch pruning via fractional knapsack upper bounds, cutting down exponential complexity.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge badge-bnb">Live Tree Graph</span>
                <span className="badge badge-bnb">Sub-tree Pruning</span>
                <span className="badge badge-bnb">Zoom & Inspect</span>
              </div>
            </div>

          </div>
        </div>

        {/* ─── Bottom CTA Launch Banner ─── */}
        <div className="glass-panel" style={{
          padding: '36px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(230,57,70,0.5)',
          background: 'linear-gradient(135deg, rgba(35,6,8,0.95) 0%, rgba(15,2,3,0.98) 100%)',
          boxShadow: '0 0 50px rgba(230,57,70,0.3), 0 20px 60px rgba(0,0,0,0.9)'
        }}>
          <div className="scanline-effect" />

          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            🎭 💰 ⏱️
          </div>

          <h2 className="font-hero" style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            color: '#ffd700',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            THE VAULT DOORS ARE OPENING
          </h2>

          <p style={{
            color: 'var(--text-primary)',
            fontSize: '1rem',
            maxWidth: '650px',
            margin: '0 auto 28px',
            lineHeight: '1.6'
          }}>
            Configure custom room counts, set your Indian Rupee targets, and test your speed and intuition against classic computer science algorithms.
          </p>

          <button
            onClick={handleStart}
            className="btn-cyber btn-accent-gold animate-pulse-glow"
            style={{
              padding: '16px 44px',
              fontSize: '1.25rem',
              borderRadius: '14px',
              boxShadow: '0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(230,57,70,0.4)',
              cursor: 'pointer'
            }}
          >
            <Zap size={22} color="#0f0304" />
            <span className="font-hero" style={{ fontSize: '1.5rem', letterSpacing: '0.08em' }}>
              LAUNCH HEIST OPERATION NOW
            </span>
            <ChevronRight size={22} color="#0f0304" />
          </button>
        </div>

      </div>
    </div>
  );
};

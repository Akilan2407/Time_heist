/**
 * Native Web Audio API synthesizer for "Time Heist" sound effects.
 * Preloads and warms audio context on user interaction, supports localStorage persistence,
 * and generates short, crisp procedural sound effects (< 1s each).
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private isPreloaded: boolean = false;

  constructor() {
    // Read persisted preference from localStorage (default: true)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('time_heist_sound_enabled');
        this.enabled = saved !== null ? saved === 'true' : true;
      } catch (e) {
        this.enabled = true;
      }

      // Preload / warm AudioContext on first user interaction
      const warmup = () => {
        this.preload();
        window.removeEventListener('click', warmup);
        window.removeEventListener('keydown', warmup);
        window.removeEventListener('touchstart', warmup);
      };
      window.addEventListener('click', warmup, { once: true });
      window.addEventListener('keydown', warmup, { once: true });
      window.addEventListener('touchstart', warmup, { once: true });
    }
  }

  /**
   * Preload/warm AudioContext to eliminate initial latency
   */
  public preload() {
    if (this.isPreloaded && this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!this.ctx) {
          this.ctx = new AudioContextClass();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.isPreloaded = true;
      }
    } catch (e) {
      console.warn('Web Audio initialization failed:', e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('time_heist_sound_enabled', String(enabled));
    } catch (e) {
      // ignore
    }
    if (enabled) {
      this.preload();
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    this.preload();
    return this.ctx;
  }

  /**
   * UI Click / Navigation
   */
  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  /**
   * Soft Countdown Tick (only in final 10 seconds)
   */
  playCountdownTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  /**
   * Bright Coin / Chime on successful loot completion
   */
  playLootSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Harmonic arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Distinct "Cut" / "Snip" sound when Branch & Bound node is pruned
   */
  playPruneNode() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      // Snip scissor frequency drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {}
  }

  /**
   * Short Alarm / Fail sound on guard catch or timeout
   */
  playHeistAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Two-tone rapid warble (480Hz -> 720Hz -> 380Hz)
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.linearRampToValueAtTime(750, t + 0.15);
      osc.frequency.linearRampToValueAtTime(420, t + 0.35);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }

  /**
   * Scout Drone reconnaissance sonar ping
   */
  playScoutDronePing() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1280, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }

  /**
   * Lockpick mechanical tick
   */
  playLockpickTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 + Math.random() * 300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {}
  }
}

export const soundFx = new SoundEffects();

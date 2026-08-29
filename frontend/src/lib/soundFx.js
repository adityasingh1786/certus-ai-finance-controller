/**
 * soundFx.js — Sovereign Web Audio API Pure Multi-Oscillator Sound Synthesizer
 * Synthesizes high-frequency mechanical clicks, harmonic arpeggios, frequency pitch sweeps,
 * resonant laser hums, and sub-bass shockwaves with zero external asset latency.
 */

let audioCtx = null;
let isMuted = false;

// Initialize or get the AudioContext on user gesture
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  getIsMuted() {
    return isMuted;
  },

  setMuted(muted) {
    isMuted = muted;
    try {
      localStorage.setItem('certus_sound_muted', muted ? 'true' : 'false');
    } catch (_) {}
  },

  toggleMute() {
    this.setMuted(!isMuted);
    return isMuted;
  },

  initFromStorage() {
    try {
      const stored = localStorage.getItem('certus_sound_muted');
      if (stored !== null) {
        isMuted = stored === 'true';
      }
    } catch (_) {}
  },

  // 1. Crisp Tactile Click (800Hz -> 200Hz sine pulse, 15ms)
  playClick() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.018);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (_) {}
  },

  // 2. Harmonic 3-Way Match Chime (3-note ascending chord C5 -> E5 -> G5, 200ms)
  playMatchChime() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + idx * 0.04;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (_) {}
  },

  // 3. Fail-Closed Anomaly Buzzer (Sawtooth dissonant dual tone 180Hz + 233Hz)
  playErrorBuzzer() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [180, 233.08]; // Low minor third tension
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch (_) {}
  },

  // 4. Harmonic Bootloader Pitch Ramp (Multi-oscillator frequency sweep 220Hz -> 880Hz)
  playBootSweep(durationSec = 2.2) {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + durationSec);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + durationSec);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.04, now + durationSec * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec + 0.05);
      osc2.stop(now + durationSec + 0.05);
    } catch (_) {}
  },

  // 5. Sub-Bass Shockwave Detonation (55Hz -> 20Hz boom)
  playShockwaveBoom() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (_) {}
  },

  // 6. Laser Spline Wire Pulse Hum (440Hz short laser blip)
  playLaserHum() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  },
};

soundManager.initFromStorage();

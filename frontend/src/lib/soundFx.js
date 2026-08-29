/**
 * soundFx.js — Zero-Dependency Sovereign Web Audio API Micro-Haptics
 * Synthesizes crisp, high-frequency mechanical clicks, harmonic match chimes,
 * and anomaly alert tones with zero external asset latency.
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
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch (_) {}
  },

  // 2. Harmonic 3-Way Match Chime (Dual-frequency chord 523Hz + 659Hz, 120ms)
  playMatchChime() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25]; // C5, E5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + idx * 0.03;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      });
    } catch (_) {}
  },

  // 3. Quarantine / Anomaly Alert Tone (440Hz -> 330Hz, 80ms)
  playAlert() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch (_) {}
  },
};

// Initialize mute state
if (typeof window !== 'undefined') {
  soundManager.initFromStorage();
}

import { useCallback } from 'react';
import { soundManager } from '../lib/soundFx';

/**
 * Custom React Hook for Web Audio Acoustic & Haptic Feedback
 */
export function useSoundEffects() {
  const playClick = useCallback(() => {
    try {
      soundManager.playClick();
    } catch (_) {}
  }, []);

  const playMatchChime = useCallback(() => {
    try {
      soundManager.playMatchChime();
    } catch (_) {}
  }, []);

  const playQuarantineChime = useCallback(() => {
    try {
      soundManager.playQuarantineChime();
    } catch (_) {}
  }, []);

  return {
    playClick,
    playMatchChime,
    playQuarantineChime,
  };
}

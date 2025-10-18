import { SceneJSON, GuidanceEvent } from '../types';
import { MIN_CUE_INTERVAL_MS } from '../constants';

export function deriveGuidance(
  scene: SceneJSON,
  lastMsg?: GuidanceEvent,
  safeMode: boolean = false
): GuidanceEvent | null {
  const now = Date.now();

  let text = '';
  let haptic: 'SHORT' | 'LONG' | 'NONE' = 'NONE';

  // Priority 1: Obstacle close
  if (scene.obstacle_close) {
    text = 'Obstacle close. Stop.';
    haptic = 'LONG';
  }
  // Priority 2: Curb ahead
  else if (scene.curb_ahead) {
    text = 'Curb in two steps.';
    haptic = 'SHORT';
  }
  // Priority 3: Crosswalk guidance
  else if (scene.crosswalk_present) {
    switch (scene.alignment) {
      case 'center':
        text = 'Crosswalk ahead.';
        haptic = 'SHORT';
        break;
      case 'veer_left':
        text = 'Veer left.';
        haptic = 'SHORT';
        break;
      case 'veer_right':
        text = 'Veer right.';
        haptic = 'SHORT';
        break;
      case 'unknown':
        text = 'Crosswalk detected, alignment unclear.';
        haptic = 'NONE';
        break;
    }
  }

  // If no guidance needed, return null
  if (!text) {
    return null;
  }

  // Debounce: if same text was recently spoken, suppress
  const minInterval = safeMode ? MIN_CUE_INTERVAL_MS * 1.5 : MIN_CUE_INTERVAL_MS;

  if (lastMsg) {
    const timeSinceLastMsg = now - lastMsg.ts;
    if (lastMsg.text === text && timeSinceLastMsg < minInterval) {
      return null; // Suppress repeat
    }
  }

  return {
    ts: now,
    text,
    haptic,
  };
}

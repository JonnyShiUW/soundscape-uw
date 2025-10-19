import { SceneJSON, GuidanceEvent } from '../types';
import { MIN_CUE_INTERVAL_MS } from '../constants';

export function deriveGuidance(
  scene: SceneJSON,
  lastMsg?: GuidanceEvent,
  safeMode: boolean = false
): GuidanceEvent | null {
  const now = Date.now();

  console.log('🚦 [GUIDANCE] Analyzing scene:', JSON.stringify(scene, null, 2));

  let text = '';
  let haptic: 'SHORT' | 'LONG' | 'NONE' = 'NONE';

  // Priority 1: Obstacle close
  if (scene.obstacle_close) {
    text = 'Obstacle close. Stop.';
    haptic = 'LONG';
    console.log('⚠️  [GUIDANCE] Obstacle detected');
  }
  // Priority 2: Curb ahead
  else if (scene.curb_ahead) {
    text = 'Curb in two steps.';
    haptic = 'SHORT';
    console.log('⚠️  [GUIDANCE] Curb detected');
  }
  // Priority 3: Crosswalk guidance with pedestrian signal
  else if (scene.crosswalk_present) {
    console.log('🚸 [GUIDANCE] Crosswalk detected, signal state:', scene.pedestrian_signal);
    // Check for pedestrian signal first
    if (scene.pedestrian_signal === 'walk') {
      switch (scene.alignment) {
        case 'center':
          text = 'Walk sign. Crosswalk ahead.';
          haptic = 'SHORT';
          break;
        case 'veer_left':
          text = 'Walk sign. Veer left.';
          haptic = 'SHORT';
          break;
        case 'veer_right':
          text = 'Walk sign. Veer right.';
          haptic = 'SHORT';
          break;
        case 'unknown':
          text = 'Walk sign. Crosswalk detected, alignment unclear.';
          haptic = 'NONE';
          break;
      }
    } else if (scene.pedestrian_signal === 'countdown') {
      // Flashing countdown - don't start crossing, but inform user
      text = 'Countdown signal. Do not start crossing.';
      haptic = 'SHORT';
    } else if (scene.pedestrian_signal === 'dont_walk') {
      // Solid don't walk - hard stop
      text = 'Stop. Do not walk signal.';
      haptic = 'LONG';
    } else {
      // No signal detected, use normal crosswalk guidance
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
  }

  // If no guidance needed, return null
  if (!text) {
    console.log('ℹ️  [GUIDANCE] No guidance needed');
    return null;
  }

  // Debounce: if same text was recently spoken, suppress
  const minInterval = safeMode ? MIN_CUE_INTERVAL_MS * 1.5 : MIN_CUE_INTERVAL_MS;

  if (lastMsg) {
    const timeSinceLastMsg = now - lastMsg.ts;
    if (lastMsg.text === text && timeSinceLastMsg < minInterval) {
      console.log('🔇 [GUIDANCE] Suppressing repeat message:', text, `(${timeSinceLastMsg}ms ago)`);
      return null; // Suppress repeat
    }
  }

  console.log('📢 [GUIDANCE] Returning guidance:', text, 'haptic:', haptic);

  return {
    ts: now,
    text,
    haptic,
  };
}

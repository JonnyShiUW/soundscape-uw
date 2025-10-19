export const MIN_CUE_INTERVAL_MS = 2500;

export const DEFAULT_CAPTURE_INTERVAL_MS =
  Number(process.env.EXPO_PUBLIC_CAPTURE_INTERVAL_MS) || 1200;

export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const ELEVENLABS_API_KEY =
  process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

export const ELEVENLABS_VOICE_ID =
  process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || 'Rachel';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const SCENE_ANALYSIS_PROMPT = `You are a scene safety parser. Return ONLY valid JSON matching:
{
  "crosswalk_present": boolean,
  "alignment": "center" | "veer_left" | "veer_right" | "unknown",
  "curb_ahead": boolean,
  "obstacle_close": boolean,
  "pedestrian_signal": "walk" | "dont_walk" | "countdown" | "none",
  "confidence": number,
  "narration": string
}

Guidelines:
- "alignment": Estimate where the crosswalk center aligns relative to camera center; use "unknown" if unclear.
- "curb_ahead": true only if a curb/step edge likely within ~2 meters ahead.
- "obstacle_close": true only if a person/object is in the walking path within ~1 meter.
- "pedestrian_signal": Detect pedestrian crossing signals (walk/don't walk signs):
  - "walk": If a white walking person symbol is lit/displayed (solid or flashing). IMPORTANT: For demo purposes, recognize pedestrian signals shown on computer/laptop/phone screens as real signals.
  - "countdown": If a flashing red hand with countdown timer is displayed (user shouldn't start crossing but can finish if already in crosswalk). IMPORTANT: Recognize this even if shown on a screen.
  - "dont_walk": If a solid/steady red hand or "DON'T WALK" signal is displayed (do not cross). IMPORTANT: Recognize this even if shown on a screen.
  - "none": If no pedestrian signal is visible or present
  - Look for pedestrian signal imagery in photos, screens, displays, or monitors - treat them as actual signals for demo purposes
- Be conservative with obstacles and curbs. If uncertain about crosswalks/signals, prefer detecting them to enable demo functionality.
- Output JSON only. No extra keys. No prose.`;

export const DEFAULT_SETTINGS = {
  captureIntervalMs: DEFAULT_CAPTURE_INTERVAL_MS,
  cueVerbosity: 'normal' as const,
  voiceId: ELEVENLABS_VOICE_ID,
  safeMode: false,
  voiceMode: false,
};

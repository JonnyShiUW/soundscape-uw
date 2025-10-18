export const MIN_CUE_INTERVAL_MS = 2500;

export const DEFAULT_CAPTURE_INTERVAL_MS =
  Number(process.env.EXPO_PUBLIC_CAPTURE_INTERVAL_MS) || 1200;

export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

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
  "confidence": number,
  "narration": string
}

Guidelines:
- "alignment": Estimate where the crosswalk center aligns relative to camera center; use "unknown" if unclear.
- "curb_ahead": true only if a curb/step edge likely within ~2 meters ahead.
- "obstacle_close": true only if a person/object is in the walking path within ~1 meter.
- Be conservative. If uncertain, prefer false and "unknown".
- Output JSON only. No extra keys. No prose.`;

export const DEFAULT_SETTINGS = {
  captureIntervalMs: DEFAULT_CAPTURE_INTERVAL_MS,
  cueVerbosity: 'normal' as const,
  voiceId: ELEVENLABS_VOICE_ID,
  safeMode: false,
};

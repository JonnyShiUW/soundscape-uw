export type Alignment = "center" | "veer_left" | "veer_right" | "unknown";

export type SceneJSON = {
  crosswalk_present: boolean;
  alignment: Alignment;
  curb_ahead: boolean;
  obstacle_close: boolean;
  confidence: number;
  narration?: string;
};

export type GuidanceEvent = {
  ts: number;
  text: string;
  haptic: "SHORT" | "LONG" | "NONE";
};

export type AppSettings = {
  captureIntervalMs: number;
  cueVerbosity: "normal" | "brief";
  voiceId: string;
  safeMode: boolean;
};

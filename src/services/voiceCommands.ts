import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export type VoiceCommand = 'where_am_i' | 'guide_me' | 'what_do_you_see' | 'unknown';

export interface VoiceCommandResult {
  command: VoiceCommand;
  transcript: string;
}

/**
 * Request speech recognition permissions
 */
export async function requestSpeechRecognitionPermission(): Promise<boolean> {
  try {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    return result.granted;
  } catch (error) {
    console.error('Error requesting speech recognition permission:', error);
    return false;
  }
}

/**
 * Check if speech recognition is available on the device
 */
export async function isSpeechRecognitionAvailable(): Promise<boolean> {
  try {
    const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({ androidRecognitionServicePackage: undefined });
    return supported.locales.length > 0;
  } catch (error) {
    console.error('Error checking speech recognition availability:', error);
    return false;
  }
}

/**
 * Parse transcript to determine which command was spoken
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const normalized = transcript.toLowerCase().trim();

  console.log('🎤 [VOICE] Parsing transcript:', normalized);

  // Match "Where am I" variations
  if (
    normalized.includes('where am i') ||
    normalized.includes('where\'s my location') ||
    normalized.includes('what\'s my location') ||
    normalized.includes('where are we') ||
    normalized.includes('current location')
  ) {
    return 'where_am_i';
  }

  // Match "Guide me" variations
  if (
    normalized.includes('guide me') ||
    normalized.includes('start guidance') ||
    normalized.includes('start guiding') ||
    normalized.includes('begin guidance') ||
    normalized.includes('help me navigate') ||
    normalized.includes('start') ||
    normalized.includes('stop')
  ) {
    return 'guide_me';
  }

  // Match "What do you see" variations
  if (
    normalized.includes('what do you see') ||
    normalized.includes('describe') ||
    normalized.includes('what\'s in front') ||
    normalized.includes('what\'s ahead') ||
    normalized.includes('tell me what you see') ||
    normalized.includes('scene description')
  ) {
    return 'what_do_you_see';
  }

  return 'unknown';
}

/**
 * Get the current state of speech recognition
 */
export async function getSpeechRecognitionState(): Promise<string> {
  try {
    const state = await ExpoSpeechRecognitionModule.getStateAsync();
    return state;
  } catch (error) {
    console.error('Error getting speech recognition state:', error);
    return 'unavailable';
  }
}

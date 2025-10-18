import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

let lastSpeechTime = 0;
let audioInitialized = false;

export async function initAudio(): Promise<void> {
  if (audioInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
    audioInitialized = true;
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

export async function speak(text: string): Promise<void> {
  // System TTS fallback using expo-speech
  console.log('System TTS:', text);

  try {
    // Stop any ongoing speech
    Speech.stop();

    // Speak using native TTS
    Speech.speak(text, {
      rate: 0.9,
      pitch: 1.0,
      language: 'en-US',
    });
  } catch (error) {
    console.error('Speech error:', error);
  }
}

export function triggerHaptic(type: 'SHORT' | 'LONG' | 'NONE'): void {
  if (type === 'NONE') return;

  try {
    if (type === 'SHORT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'LONG') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch (error) {
    console.warn('Haptic feedback error:', error);
  }
}

export function canSpeak(minIntervalMs: number = 2500): boolean {
  const now = Date.now();
  if (now - lastSpeechTime < minIntervalMs) {
    return false;
  }
  return true;
}

export function markSpeechTime(): void {
  lastSpeechTime = Date.now();
}

export function resetSpeechTime(): void {
  lastSpeechTime = 0;
}

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

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
  // This is the system TTS fallback
  // On web, we can use SpeechSynthesis API
  // On native, expo-speech would be needed (not included to keep deps minimal)
  // For MVP, we'll just log and rely on ElevenLabs
  console.log('System TTS:', text);

  // Simple web fallback
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
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

import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../constants';
import { speak as systemSpeak } from './audio';

let currentSound: Audio.Sound | null = null;

export async function speak(text: string, voiceId: string = ELEVENLABS_VOICE_ID): Promise<void> {
  // Stop any currently playing sound
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (e) {
      console.warn('Error stopping previous sound:', e);
    }
  }

  // If no API key, fallback to system TTS
  if (!ELEVENLABS_API_KEY) {
    await systemSpeak(text);
    return;
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const blob = await response.blob();
    const reader = new FileReader();

    const base64Audio = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Save to cache directory
    const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Play the audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;

    // Clean up after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(console.warn);
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(console.warn);
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    // Fallback to system TTS
    await systemSpeak(text);
  }
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(ELEVENLABS_API_KEY);
}

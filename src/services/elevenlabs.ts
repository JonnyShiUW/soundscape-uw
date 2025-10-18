import { File, Paths } from 'expo-file-system';
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
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio as binary data
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Write to file - save as binary data
    const fileName = `tts_${Date.now()}.mp3`;
    const file = new File(Paths.cache, fileName);
    file.create();

    // Write the raw bytes directly
    file.write(uint8Array);

    // Play the audio using expo-av
    const { sound } = await Audio.Sound.createAsync(
      { uri: file.uri },
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;

    // Clean up after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(console.warn);
        try {
          file.delete();
        } catch (e) {
          console.warn('Error deleting file:', e);
        }
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

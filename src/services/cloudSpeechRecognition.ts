import { Audio } from 'expo-av';
import { File } from 'expo-file-system';
import { GOOGLE_MAPS_API_KEY } from '../constants';

export type VoiceCommand = 'where_am_i' | 'guide_me' | 'stop' | 'what_do_you_see' | 'unknown';

export interface VoiceCommandResult {
  command: VoiceCommand;
  transcript: string;
}

let recording: Audio.Recording | null = null;

/**
 * Request audio recording permissions
 */
export async function requestAudioPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    return false;
  }
}

/**
 * Start recording audio
 */
export async function startRecording(): Promise<void> {
  try {
    console.log('🎤 [CLOUD-SPEECH] Requesting permissions...');
    const granted = await requestAudioPermission();

    if (!granted) {
      throw new Error('Audio permission not granted');
    }

    // Stop any existing recording
    if (recording) {
      await stopRecording();
    }

    console.log('🎤 [CLOUD-SPEECH] Setting up audio mode...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    console.log('🎤 [CLOUD-SPEECH] Starting recording...');
    const { recording: newRecording } = await Audio.Recording.createAsync({
      isMeteringEnabled: true,
      android: {
        extension: '.wav',
        outputFormat: Audio.AndroidOutputFormat.DEFAULT,
        audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    recording = newRecording;
    console.log('🎤 [CLOUD-SPEECH] Recording started');
  } catch (error) {
    console.error('🎤 [CLOUD-SPEECH] Failed to start recording:', error);
    throw error;
  }
}

/**
 * Stop recording and get the audio file URI
 */
export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      console.warn('🎤 [CLOUD-SPEECH] No recording to stop');
      return null;
    }

    console.log('🎤 [CLOUD-SPEECH] Stopping recording...');
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    recording = null;

    console.log('🎤 [CLOUD-SPEECH] Recording stopped, URI:', uri);
    return uri;
  } catch (error) {
    console.error('🎤 [CLOUD-SPEECH] Failed to stop recording:', error);
    recording = null;
    return null;
  }
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text API
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google API key not configured');
  }

  try {
    console.log('🎤 [CLOUD-SPEECH] Reading audio file...');

    // Read the audio file as base64 using new File API
    const file = new File(audioUri);
    const audioBase64 = await file.base64();

    console.log('🎤 [CLOUD-SPEECH] Sending to Google Speech-to-Text API...');

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_MAPS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: false,
            model: 'command_and_search',
            audioChannelCount: 1,
          },
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('🎤 [CLOUD-SPEECH] API error:', data);
      throw new Error(data.error?.message || 'Speech recognition failed');
    }

    console.log('🎤 [CLOUD-SPEECH] API response:', JSON.stringify(data, null, 2));

    if (!data.results || data.results.length === 0) {
      console.warn('🎤 [CLOUD-SPEECH] No transcription results');
      return '';
    }

    const transcript = data.results[0]?.alternatives?.[0]?.transcript || '';
    console.log('🎤 [CLOUD-SPEECH] Transcript:', transcript);

    return transcript;
  } catch (error) {
    console.error('🎤 [CLOUD-SPEECH] Transcription error:', error);
    throw error;
  }
}

/**
 * Parse transcript to determine which command was spoken
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const normalized = transcript.toLowerCase().trim();

  console.log('🎤 [CLOUD-SPEECH] Parsing transcript:', normalized);

  // Match "Where am I" variations
  if (
    normalized.includes('where am i') ||
    normalized.includes('where\'s my location') ||
    normalized.includes('what\'s my location') ||
    normalized.includes('where are we') ||
    normalized.includes('current location') ||
    normalized.includes('location')
  ) {
    return 'where_am_i';
  }

  // Match "Stop" first (more specific)
  if (
    normalized.includes('stop') ||
    normalized.includes('stop guidance') ||
    normalized.includes('stop guiding') ||
    normalized.includes('end guidance') ||
    normalized.includes('cancel')
  ) {
    return 'stop';
  }

  // Match "Guide me" / "Start" variations
  if (
    normalized.includes('guide me') ||
    normalized.includes('start guidance') ||
    normalized.includes('start guiding') ||
    normalized.includes('begin guidance') ||
    normalized.includes('help me navigate') ||
    normalized.includes('start') ||
    normalized.includes('guide')
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
    normalized.includes('scene description') ||
    normalized.includes('scene')
  ) {
    return 'what_do_you_see';
  }

  return 'unknown';
}

/**
 * Record audio, transcribe it, and parse the command
 */
export async function recognizeVoiceCommand(): Promise<VoiceCommandResult> {
  try {
    // Start recording
    await startRecording();

    // Record for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Stop recording and get URI
    const audioUri = await stopRecording();

    if (!audioUri) {
      throw new Error('Failed to record audio');
    }

    // Transcribe the audio
    const transcript = await transcribeAudio(audioUri);

    // Delete the audio file
    try {
      const file = new File(audioUri);
      await file.delete();
    } catch (e) {
      console.warn('Failed to delete audio file:', e);
    }

    if (!transcript) {
      return {
        command: 'unknown',
        transcript: '',
      };
    }

    // Parse the command
    const command = parseVoiceCommand(transcript);

    return {
      command,
      transcript,
    };
  } catch (error) {
    console.error('🎤 [CLOUD-SPEECH] Recognition error:', error);
    throw error;
  }
}

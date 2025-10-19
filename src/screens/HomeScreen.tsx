import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from '@react-navigation/native';
import { CameraPreview, CameraPreviewRef } from '../components/CameraPreview';
import { BigButton } from '../components/BigButton';
import { MicButton } from '../components/MicButton';
import { isGeminiConfigured } from '../services/gemini';
import { speak } from '../services/elevenlabs';
import { initAudio } from '../services/audio';
import { requestPermissions } from '../services/permissions';
import { loadSettings } from '../services/storage';
import { getWhereAmI, requestLocationPermission } from '../services/location';
import { recognizeVoiceCommand } from '../services/cloudSpeechRecognition';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { theme } from '../theme';

export function HomeScreen() {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDescribing, setIsDescribing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string>('');
  const cameraRef = useRef<CameraPreviewRef>(null);
  const lastLocationRequestRef = useRef<number>(0);

  useKeepAwake();

  useEffect(() => {
    initializeApp();
  }, []);

  // Reload settings when screen is focused (e.g., after returning from Settings)
  useFocusEffect(
    React.useCallback(() => {
      const reloadSettings = async () => {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
      };
      reloadSettings();
    }, [])
  );


  const initializeApp = async () => {
    await initAudio();
    const perms = await requestPermissions();

    if (!perms.camera) {
      Alert.alert(
        'Camera Permission Required',
        'SoundScape needs camera access to provide guidance. Please enable camera permissions in Settings.',
        [{ text: 'OK' }]
      );
    }

    // Request location permission
    await requestLocationPermission();

    const loadedSettings = await loadSettings();
    setSettings(loadedSettings);
  };

  const handleToggleActive = () => {
    setIsActive((prev) => !prev);
  };

  const handleDescribeScene = async () => {
    if (isDescribing) return;

    setIsDescribing(true);

    try {
      if (!isGeminiConfigured()) {
        await speak(
          'Scene description unavailable. Vision service is offline.',
          settings.voiceId
        );
        return;
      }

      if (!cameraRef.current) {
        await speak('Camera not ready.', settings.voiceId);
        return;
      }

      console.log('🎤 [DESCRIBE] User requested scene description');

      // Capture and get narration from Gemini
      const narration = await cameraRef.current.captureAndDescribe();

      console.log('🎤 [DESCRIBE] Speaking narration:', narration);
      await speak(narration, settings.voiceId);
    } catch (error) {
      console.error('❌ [DESCRIBE] Scene description error:', error);
      await speak('Scene description unavailable.', settings.voiceId);
    } finally {
      setIsDescribing(false);
    }
  };

  const handleWhereAmI = async () => {
    // Check cooldown (2 seconds)
    const now = Date.now();
    const cooldownMs = 2000;

    if (now - lastLocationRequestRef.current < cooldownMs) {
      console.log('📍 [LOCATION] Request throttled (cooldown active)');
      return;
    }

    if (isLocating) {
      console.log('📍 [LOCATION] Request already in progress');
      return;
    }

    setIsLocating(true);
    lastLocationRequestRef.current = now;

    try {
      console.log('📍 [LOCATION] User requested "Where am I?"');

      // Get location and reverse geocode
      const result = await getWhereAmI();

      console.log('📍 [LOCATION] Speaking phrase:', result.phrase);

      // Update location message for pill display
      setLocationMessage(result.phrase);

      // Speak the phrase
      await speak(result.phrase, settings.voiceId);
    } catch (error) {
      console.error('❌ [LOCATION] Error getting location:', error);
      const errorPhrase = 'Location unknown.';
      setLocationMessage(errorPhrase);
      await speak(errorPhrase, settings.voiceId);
    } finally {
      setIsLocating(false);
    }
  };

  const handleVoiceCommand = (command: string, transcript: string) => {
    console.log('🎤 [VOICE] Received command:', command, 'from:', transcript);

    switch (command) {
      case 'where_am_i':
        handleWhereAmI();
        break;
      case 'guide_me':
        // Start guidance if not active
        if (!isActive) {
          handleToggleActive();
        }
        break;
      case 'stop':
        // Stop guidance if active
        if (isActive) {
          handleToggleActive();
        }
        break;
      case 'what_do_you_see':
        handleDescribeScene();
        break;
      case 'unknown':
        speak('Command not recognized. Try "Where am I", "Guide me", "Stop", or "What do you see".', settings.voiceId);
        break;
    }
  };

  const handleMicPress = async () => {
    if (isListening) {
      console.log('🎤 [VOICE] Already listening, ignoring press');
      return;
    }

    setIsListening(true);

    try {
      console.log('🎤 [VOICE] Starting voice recognition...');

      // Provide audio feedback
      await speak('Listening...', settings.voiceId);

      // Recognize voice command using cloud API (works in Expo Go!)
      const result = await recognizeVoiceCommand();

      console.log('🎤 [VOICE] Received command:', result.command, 'from:', result.transcript);

      // Handle the command
      handleVoiceCommand(result.command, result.transcript);
    } catch (error) {
      console.error('🎤 [VOICE] Failed to recognize voice:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('Audio permission not granted')) {
        await speak('Microphone permission not granted', settings.voiceId);
      } else if (errorMessage.includes('API key not configured')) {
        await speak('Voice recognition not configured', settings.voiceId);
      } else {
        await speak('Could not understand. Please try again.', settings.voiceId);
      }
    } finally {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraPreview
        ref={cameraRef}
        isActive={isActive}
        captureIntervalMs={settings.captureIntervalMs}
        safeMode={settings.safeMode}
        voiceId={settings.voiceId}
        locationMessage={locationMessage}
      />

      <View style={styles.controlsContainer}>
        {settings.voiceMode ? (
          // Voice Mode: Show only mic button
          <MicButton
            onPress={handleMicPress}
            isListening={isListening}
            disabled={isDescribing || isLocating}
          />
        ) : (
          // Button Mode: Show all three buttons
          <>
            <BigButton
              title={isActive ? 'Stop' : 'Start'}
              onPress={handleToggleActive}
              variant={isActive ? 'danger' : 'primary'}
            />

            <BigButton
              title="Where am I?"
              onPress={handleWhereAmI}
              variant="secondary"
              disabled={isLocating}
              style={styles.locationButton}
            />

            <BigButton
              title="Describe Scene"
              onPress={handleDescribeScene}
              variant="secondary"
              disabled={isDescribing}
              style={styles.describeButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  locationButton: {
    marginTop: theme.spacing.sm,
  },
  describeButton: {
    marginTop: theme.spacing.sm,
  },
});

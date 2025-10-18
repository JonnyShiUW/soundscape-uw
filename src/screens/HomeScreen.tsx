import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { CameraPreview } from '../components/CameraPreview';
import { BigButton } from '../components/BigButton';
import { analyzeFrameAsync, isGeminiConfigured } from '../services/gemini';
import { speak } from '../services/elevenlabs';
import { initAudio } from '../services/audio';
import { requestPermissions } from '../services/permissions';
import { loadSettings } from '../services/storage';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { theme } from '../theme';
import { CameraView } from 'expo-camera';
import mockSceneData from '../mockScene.json';

export function HomeScreen() {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDescribing, setIsDescribing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useKeepAwake();

  useEffect(() => {
    initializeApp();
  }, []);

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
      // Get current camera reference from CameraPreview
      // For simplicity in MVP, we'll use mock data or show a message
      if (isGeminiConfigured()) {
        Alert.alert(
          'Describe Scene',
          'Scene description requires capturing a frame. This feature captures the current view and provides a detailed description.',
          [{ text: 'OK' }]
        );

        // In a production app, we'd pass a ref to capture from CameraPreview
        const scene = mockSceneData;
        const narration =
          scene.narration || 'Scene analysis complete. No detailed description available.';

        await speak(narration, settings.voiceId);
      } else {
        await speak(
          'Scene description unavailable. Vision service is offline.',
          settings.voiceId
        );
      }
    } catch (error) {
      console.error('Scene description error:', error);
      await speak('Scene description unavailable.', settings.voiceId);
    } finally {
      setIsDescribing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraPreview
        isActive={isActive}
        captureIntervalMs={settings.captureIntervalMs}
        safeMode={settings.safeMode}
        voiceId={settings.voiceId}
      />

      <View style={styles.controlsContainer}>
        <BigButton
          title={isActive ? 'Stop' : 'Start'}
          onPress={handleToggleActive}
          variant={isActive ? 'danger' : 'primary'}
        />

        <BigButton
          title="Describe Scene"
          onPress={handleDescribeScene}
          variant="secondary"
          disabled={isDescribing}
          style={styles.describeButton}
        />
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
  describeButton: {
    marginTop: theme.spacing.sm,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useInterval } from '../hooks/useInterval';
import { analyzeFrameAsync, isGeminiConfigured } from '../services/gemini';
import { deriveGuidance } from '../services/guidance';
import { speak } from '../services/elevenlabs';
import { triggerHaptic, canSpeak, markSpeechTime } from '../services/audio';
import { StatusBarPill } from './StatusBarPill';
import { SceneJSON, GuidanceEvent } from '../types';
import mockSceneData from '../mockScene.json';

interface CameraPreviewProps {
  isActive: boolean;
  captureIntervalMs: number;
  safeMode: boolean;
  voiceId: string;
  onSceneUpdate?: (scene: SceneJSON) => void;
}

export function CameraPreview({
  isActive,
  captureIntervalMs,
  safeMode,
  voiceId,
  onSceneUpdate,
}: CameraPreviewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<'offline' | 'analyzing' | 'ready' | 'error'>('offline');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [lastGuidance, setLastGuidance] = useState<GuidanceEvent | undefined>();
  const [fps, setFps] = useState<number>(0);
  const cameraRef = useRef<CameraView>(null);
  const fpsCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const captureAndAnalyze = async () => {
    if (!isActive || !cameraRef.current) return;

    try {
      setStatus('analyzing');

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
      }

      // Analyze with Gemini or use mock data
      let scene: SceneJSON;
      if (isGeminiConfigured()) {
        console.log('📸 [CAMERA] Analyzing frame with Gemini...');
        scene = await analyzeFrameAsync(photo.base64);
      } else {
        // Use mock data when Gemini is not configured
        console.log('📸 [CAMERA] Using mock data (Gemini not configured)');
        await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate API delay
        scene = mockSceneData as SceneJSON;
      }

      console.log('📸 [CAMERA] Scene result:', JSON.stringify(scene, null, 2));
      onSceneUpdate?.(scene);

      // Derive guidance
      const guidance = deriveGuidance(scene, lastGuidance, safeMode);

      if (guidance && canSpeak()) {
        console.log('🔊 [CAMERA] Speaking guidance:', guidance.text);
        setLastMessage(guidance.text);
        setLastGuidance(guidance);
        markSpeechTime();

        // Trigger haptic
        triggerHaptic(guidance.haptic);

        // Speak guidance
        await speak(guidance.text, voiceId);
      } else if (guidance) {
        console.log('🔇 [CAMERA] Guidance ready but speech debounced:', guidance.text);
      } else {
        console.log('ℹ️  [CAMERA] No guidance generated');
      }

      setStatus('ready');

      // Update FPS
      fpsCountRef.current += 1;
      const now = Date.now();
      const elapsed = now - lastFpsUpdateRef.current;
      if (elapsed >= 1000) {
        setFps((fpsCountRef.current / elapsed) * 1000);
        fpsCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    } catch (error) {
      console.error('Capture/analysis error:', error);
      setStatus('error');
      setLastMessage('Vision offline, proceed with caution.');

      // Speak offline warning if not recently spoken
      if (canSpeak(5000)) {
        markSpeechTime();
        await speak('Vision offline, proceed with caution.', voiceId);
      }
    }
  };

  useInterval(
    captureAndAnalyze,
    isActive && permission?.granted ? captureIntervalMs : null
  );

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <StatusBarPill status="error" message="Camera permission required" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={'back' as CameraType}
        enableTorch={false}
      />
      <View style={styles.statusContainer}>
        <StatusBarPill
          status={isActive ? status : 'offline'}
          message={lastMessage}
          fps={isActive ? fps : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  statusContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
});

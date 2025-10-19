import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { loadSettings, saveSettings, resetSettings } from '../services/storage';
import { BigButton } from '../components/BigButton';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { theme } from '../theme';

export function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(settings);
      Alert.alert('Settings Saved', 'Your preferences have been updated.', [
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            setSettings(DEFAULT_SETTINGS);
            Alert.alert('Settings Reset', 'All settings have been reset to defaults.', [
              { text: 'OK' },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Capture Settings</Text>

        <View style={styles.setting}>
          <Text style={styles.label}>
            Capture Interval: {settings.captureIntervalMs}ms
          </Text>
          <Text style={styles.description}>
            How often to analyze the scene (lower = more frequent, higher battery usage)
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={800}
            maximumValue={3000}
            step={100}
            value={settings.captureIntervalMs}
            onValueChange={(value) =>
              setSettings({ ...settings, captureIntervalMs: value })
            }
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Settings</Text>

        <View style={styles.setting}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Voice Mode</Text>
              <Text style={styles.description}>
                Use voice commands instead of buttons (powered by Google Cloud Speech-to-Text)
              </Text>
            </View>
            <Switch
              value={settings.voiceMode}
              onValueChange={(value) =>
                setSettings({ ...settings, voiceMode: value })
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>ElevenLabs Voice ID</Text>
          <Text style={styles.description}>
            Voice ID for text-to-speech (e.g., Rachel, Adam)
          </Text>
          <TextInput
            style={styles.input}
            value={settings.voiceId}
            onChangeText={(text) => setSettings({ ...settings, voiceId: text })}
            placeholder="Enter voice ID"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Cue Verbosity</Text>
              <Text style={styles.description}>
                {settings.cueVerbosity === 'normal' ? 'Normal' : 'Brief'} mode
              </Text>
            </View>
            <Switch
              value={settings.cueVerbosity === 'brief'}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  cueVerbosity: value ? 'brief' : 'normal',
                })
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety</Text>

        <View style={styles.setting}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Safe Mode</Text>
              <Text style={styles.description}>
                Increases debounce time for more conservative guidance
              </Text>
            </View>
            <Switch
              value={settings.safeMode}
              onValueChange={(value) =>
                setSettings({ ...settings, safeMode: value })
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.success,
              }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <BigButton
          title={isSaving ? 'Saving...' : 'Save Settings'}
          onPress={handleSave}
          disabled={isSaving}
        />
        <BigButton
          title="Reset to Defaults"
          onPress={handleReset}
          variant="secondary"
          style={styles.resetButton}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About SoundScape Seattle</Text>
        <Text style={styles.infoText}>
          Version 1.0.0{'\n'}
          {'\n'}
          A voice-first pedestrian assistant for blind and low-vision users.
          {'\n'}
          {'\n'}
          Privacy: No images are stored. All processing is done in real-time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.5,
  },
  setting: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    marginTop: 0,
  },
  infoSection: {
    marginTop: 0,
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

import * as SecureStore from 'expo-secure-store';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const SETTINGS_KEY = 'app_settings';

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function resetSettings(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}

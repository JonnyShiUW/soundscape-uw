import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export async function requestPermissions(): Promise<{
  camera: boolean;
  audio: boolean;
}> {
  try {
    const [cameraStatus, audioStatus] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Audio.requestPermissionsAsync(),
    ]);

    return {
      camera: cameraStatus.status === 'granted',
      audio: audioStatus.status === 'granted',
    };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return {
      camera: false,
      audio: false,
    };
  }
}

export async function checkPermissions(): Promise<{
  camera: boolean;
  audio: boolean;
}> {
  try {
    const [cameraStatus, audioStatus] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      Audio.getPermissionsAsync(),
    ]);

    return {
      camera: cameraStatus.status === 'granted',
      audio: audioStatus.status === 'granted',
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return {
      camera: false,
      audio: false,
    };
  }
}

# SoundScape Seattle

A voice-first pedestrian assistant for blind and low-vision users on/near UW campus. Built as a 24-hour MVP using React Native (Expo), Gemini Vision for scene understanding, and ElevenLabs TTS for spoken guidance.

## Features

### Core MVP Features

1. **Crosswalk & Alignment Guidance** (every 1-2 seconds)
   - Detects crosswalks in camera view
   - Provides directional cues: "Crosswalk ahead", "Veer left", "Veer right"
   - Helps users maintain proper alignment

2. **Curb & Obstacle Alerts**
   - Warns of curbs/steps within ~2 meters
   - Alerts about close obstacles within ~1 meter
   - Haptic feedback accompanies voice cues

3. **Describe Scene (On-Demand)**
   - Tap button to get detailed scene description
   - Gemini provides narrative context about surroundings

### Safety Features

- Advisory cues only (not full navigation)
- Rate limiting: minimum 2.5s between cues
- Suppresses repeat messages unless state changes
- Offline fallback with system TTS
- Safe mode option for more conservative guidance

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for Android emulator)
- Physical device recommended for best camera performance

### Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_API_KEY=your_google_gemini_api_key_here
   EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   EXPO_PUBLIC_ELEVENLABS_VOICE_ID=Rachel
   EXPO_PUBLIC_CAPTURE_INTERVAL_MS=1200
   ```

3. Get API Keys:
   - **Google Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **ElevenLabs**: [ElevenLabs Dashboard](https://elevenlabs.io/) (free tier available)

### Installation

```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### Running the App

#### On Physical Device (Recommended)
1. Install Expo Go app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan QR code from terminal with:
   - iOS: Camera app
   - Android: Expo Go app

#### On Emulator/Simulator
```bash
# iOS (Mac only)
npm run ios

# Android
npm run android
```

### Update app.json with Environment Variables

Since Expo uses `expo-constants`, update your `app.json` to include environment variables:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_GOOGLE_API_KEY": "${EXPO_PUBLIC_GOOGLE_API_KEY}",
      "EXPO_PUBLIC_ELEVENLABS_API_KEY": "${EXPO_PUBLIC_ELEVENLABS_API_KEY}",
      "EXPO_PUBLIC_ELEVENLABS_VOICE_ID": "${EXPO_PUBLIC_ELEVENLABS_VOICE_ID}",
      "EXPO_PUBLIC_CAPTURE_INTERVAL_MS": "${EXPO_PUBLIC_CAPTURE_INTERVAL_MS}"
    }
  }
}
```

Or manually add your keys to `app.json` for testing (NOT recommended for production):

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_GOOGLE_API_KEY": "your-key-here",
      "EXPO_PUBLIC_ELEVENLABS_API_KEY": "your-key-here",
      "EXPO_PUBLIC_ELEVENLABS_VOICE_ID": "Rachel",
      "EXPO_PUBLIC_CAPTURE_INTERVAL_MS": "1200"
    }
  }
}
```

## Usage

### Home Screen

1. **Grant Permissions**: Allow camera and microphone access when prompted
2. **Start Guidance**: Tap the large "Start" button
3. **Point Camera Forward**: Hold phone in portrait mode, camera facing forward
4. **Listen for Cues**: Voice guidance and haptic feedback will provide directional cues
5. **Describe Scene**: Tap "Describe Scene" for detailed narrative of current view
6. **Stop**: Tap "Stop" button to end guidance

### Settings Screen

Customize your experience:

- **Capture Interval**: Adjust how often scenes are analyzed (800ms - 3000ms)
- **ElevenLabs Voice ID**: Change voice (e.g., Rachel, Adam, Antoni)
- **Cue Verbosity**: Toggle between normal and brief mode
- **Safe Mode**: Enable for more conservative guidance with longer debounce times

## Architecture

### Tech Stack

- **Frontend**: React Native with Expo
- **Camera**: `expo-camera` for cross-platform camera access
- **AI Vision**: Google Gemini 1.5 Flash for scene analysis
- **TTS**: ElevenLabs API for high-quality voice synthesis
- **Storage**: `expo-secure-store` for settings persistence
- **Navigation**: React Navigation bottom tabs

### Project Structure

```
/soundscape-seattle
├── src/
│   ├── components/
│   │   ├── CameraPreview.tsx      # Camera + scene analysis loop
│   │   ├── BigButton.tsx          # Accessible large buttons
│   │   └── StatusBarPill.tsx      # Status indicator
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Main guidance interface
│   │   └── SettingsScreen.tsx     # User preferences
│   ├── services/
│   │   ├── gemini.ts              # Gemini Vision API integration
│   │   ├── elevenlabs.ts          # ElevenLabs TTS integration
│   │   ├── guidance.ts            # Guidance logic & debouncing
│   │   ├── permissions.ts         # Permission management
│   │   ├── audio.ts               # Audio playback & haptics
│   │   └── storage.ts             # Settings persistence
│   ├── hooks/
│   │   └── useInterval.ts         # Interval hook for capture loop
│   ├── App.tsx                    # Root component
│   ├── types.ts                   # TypeScript definitions
│   ├── constants.ts               # App constants
│   ├── theme.ts                   # UI theme
│   └── mockScene.json             # Mock data for offline testing
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

### How It Works

1. **Capture Loop**: `CameraPreview` captures JPEG frames every ~1.2 seconds
2. **Scene Analysis**: Frames sent to Gemini Vision API with structured prompt
3. **JSON Validation**: Response validated with Zod schema for type safety
4. **Guidance Derivation**: `guidance.ts` prioritizes obstacles > curbs > crosswalks
5. **Debouncing**: Suppresses repeat cues within 2.5s (configurable with safe mode)
6. **Voice + Haptic**: ElevenLabs speaks guidance text, haptic feedback reinforces
7. **Offline Fallback**: If Gemini unavailable, uses mock data + system TTS

## Known Limitations

### MVP Scope

- **No traffic light detection**: Cannot detect red/green signals
- **No depth sensing**: Distance estimates are approximate from 2D vision
- **No full navigation**: Provides advisory cues only, not turn-by-turn directions
- **UW campus focused**: Optimized for university environment

### Technical Constraints

- **Battery usage**: Continuous camera + AI analysis drains battery quickly
- **Network required**: Gemini and ElevenLabs APIs require internet connection
- **Latency**: ~500-1500ms delay between capture and guidance (network dependent)
- **API costs**: Gemini and ElevenLabs have usage limits on free tiers

### Safety Disclaimers

⚠️ **This is an assistive tool, not a replacement for mobility aids or training.**

- Use in conjunction with cane, guide dog, or other mobility aids
- Do not rely solely on this app for navigation
- Always exercise caution when crossing streets
- App is advisory only and may have errors or delays

## Privacy

- **No data storage**: Images are processed in real-time and immediately discarded
- **No data collection**: No user data is collected or stored by this app
- **Third-party APIs**: Images sent to Google (Gemini) and audio to ElevenLabs per their privacy policies
- **Local settings only**: App settings stored locally on device via `expo-secure-store`

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted in device settings
- Restart app if camera preview is black
- On iOS Simulator, camera won't work (use physical device)

### No Voice Guidance
- Check that audio permissions are granted
- Verify device volume is turned up
- Check that API keys are correctly configured in `.env`
- If ElevenLabs fails, app falls back to system TTS (may be silent on some devices)

### "Vision Offline" Message
- Check internet connection
- Verify Google Gemini API key is valid and has quota
- API may be rate limited (wait a minute and restart)
- App will use mock data for testing when offline

### Slow Performance
- Increase capture interval in Settings (try 2000ms)
- Close other apps to free up memory
- Ensure good lighting for faster analysis

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Building for Production

#### iOS
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios
```

#### Android
```bash
# Build for Android
eas build --platform android
```

## Stretch Goals (Not in MVP)

- Geofencing for UW intersections
- Language toggle
- Local caching of recent cues
- Offline TTS with bundled voices
- Traffic light detection
- Route planning integration

## Contributing

This is a 24-hour MVP hackathon project. Contributions welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built for DubHacks 2025
- Powered by Google Gemini and ElevenLabs
- Inspired by Microsoft Soundscape project

## Support

For issues or questions:
- Open an issue on GitHub
- Email: [your-email]
- Discord: [your-discord]

---

**Made with ❤️ for the blind and low-vision community**

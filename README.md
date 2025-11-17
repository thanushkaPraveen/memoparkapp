# MemoParkApp - Mobile Application

A React Native mobile application built with Expo that helps individuals with mild cognitive impairment and memory challenges locate their parked vehicles using landmark-based navigation, cognitive scoring, and accessibility features.

## Overview

MemoParkApp provides an intuitive mobile experience with real-time GPS tracking, turn-by-turn navigation, and intelligent scoring systems. The app features comprehensive accessibility support including dynamic text scaling, high contrast modes, and bilingual localization (English and Te Reo Māori).

## Key Features

Secure Authentication: Full Login and Register flow with persistent sessions using react-native-keychain for secure token storage.

Session Persistence: Automatically logs in users on app start by validating saved tokens.

Global State Management: Uses Zustand for lightweight, app-wide state management (auth, parking, accessibility).

Interactive Maps: Built with react-native-maps showing user location, car location, and custom landmarks.

Parking Management:
- Save new parking locations with two-step API call (data, then photo upload)
- Fetch active parking sessions on app start and after login
- End/clear parking sessions with session history tracking

Guided Navigation: Turn-by-turn walking route from user to vehicle using react-native-maps-directions.

Custom Landmark Creation: Users can drop pins along their route (up to 4 landmarks) to create visual navigation cues.

Score Tracking: View score history from completed parking sessions with performance analytics.

Navigation Analytics: Tracks map view count and navigation screen time to measure user map dependency.

Accessibility: Profile settings for text size, icon size, and color theme adjustments with dedicated Zustand store.

Localization: Bilingual support with i18next and react-i18next (English and Te Reo Māori translations).

Emergency Call: Reusable emergency contact calling component.

## Architecture

This project uses Feature-Based Architecture organized by application features rather than file type. This structure enhances scalability and maintainability.

Directory Structure:

- app/ - Screen navigation using Expo Router with (tabs) layout and auth screens
- features/ - Core logic for each feature
  - auth/store.ts - Authentication and user data state
  - parking/store.ts - Parking session state
  - accessibility/store.ts - Theme and size preferences state
- components/ - Reusable UI components (FormField.tsx, EmergencyCallButton.tsx)
- constants/ - Shared values (colors.ts, typography.ts, appConstants.ts)
- lib/ - Configured services (axios.ts for API client)
- locales/ - Internationalization files (en.json, mi.json)

## Tech Stack

Framework: React Native 0.81.4 with Expo 54.0.12
Navigation: Expo Router (expo-router)
State Management: Zustand
API/Networking: Axios
Maps: react-native-maps and react-native-maps-directions
Hardware APIs: expo-location, expo-image-picker, expo-haptics
Secure Storage: react-native-keychain
Localization: i18next and react-i18next
UI Components: Expo Vector Icons, expo-checkbox
Language: TypeScript

## Prerequisites

Node.js (LTS version) - https://nodejs.org/
npm (comes with Node.js)
Expo CLI: npm install -g expo-cli
Physical device (iOS or Android) or Simulator/Emulator
Running MemoParkApp Backend API (Flask server) on same network
Google Maps API key with Maps SDK and Directions API enabled

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/memoparkapp.git
cd memoparkapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend API URL

The app requires a running backend server.

Find your computer's local network IP address (e.g., 192.168.1.10).

Open lib/axios.ts and update the API base URL:

```typescript
// lib/axios.ts
const API_BASE_URL = 'http://192.168.1.10:5000'; // Use your IP
```

### 4. Configure Google Maps API Key

Obtain a Google Maps API key with Maps SDK and Directions API enabled.

Open constants/appConstants.ts and add your key:

```typescript
// constants/appConstants.ts
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

Add the same key to app.json for native modules:

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### 5. Start Development Server

```bash
npm start
```

This opens the Expo CLI menu with options:
- Press 'i' to open iOS simulator
- Press 'a' to open Android emulator
- Press 'w' to open web browser
- Press 'r' to reload
- Press 'm' to toggle menu

## Available Scripts

```bash
npm start          # Start Expo development server

npm run android    # Run on Android emulator/device

npm run ios        # Run on iOS simulator (macOS only)
```


## Environment Configuration

### API Configuration

Update the backend API URL in lib/axios.ts:

```typescript
const API_BASE_URL = 'http://your-backend-ip:5000';
```

### Google Maps Setup

1. Enable Maps SDK for React Native in Google Cloud Console
2. Enable Directions API
3. Add API key to constants/appConstants.ts and app.json

### Localization

Add or update translations in locales/en.json and locales/mi.json:

```json
{
  "common": {
    "welcome": "Welcome",
    "goodbye": "Goodbye"
  }
}
```

Use translations in components:

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('common.welcome')}</Text>;
}
```

## State Management with Zustand

### Authentication Store

```typescript
import { useAuthStore } from '@/features/auth/store';

const { user, token, login, logout, isAuthenticated } = useAuthStore();
```

### Parking Store

```typescript
import { useParkingStore } from '@/features/parking/store';

const { currentSession, startSession, endSession } = useParkingStore();
```

### Accessibility Store

```typescript
import { useAccessibilityStore } from '@/features/accessibility/store';

const { fontSize, theme, setFontSize } = useAccessibilityStore();
```

## Building for Production

### iOS Build

```bash
eas build --platform ios --auto-submit
```

### Android Build

```bash
eas build --platform android --auto-submit
```

### Pre-release Checklist

- Update version in package.json and app.json
- Test on physical iOS and Android devices
- Verify all translations are complete
- Run ESLint: npm run lint
- Test all features: authentication, maps, parking, scoring
- Verify accessibility features work
- Check API endpoints with backend

## Troubleshooting

### Maps Not Displaying

Problem: Google Maps not showing or black screen
Solution:
1. Verify Google Maps API key is correct in appConstants.ts and app.json
2. Check API key has Maps SDK and Directions API enabled
3. Verify bundle ID (iOS) and package name (Android) in Google Cloud Console
4. Reinstall app: npm run android (or ios)

### Location Permission Denied

Problem: App cannot access device location
Solution:
1. Check device settings - grant location permission to app
2. For iOS: Verify NSLocationWhenInUseUsageDescription in Info.plist
3. For Android: Verify permissions in AndroidManifest.xml
4. Uninstall and reinstall app

### Backend Connection Failed

Problem: "Cannot connect to backend" error
Solution:
1. Ensure backend API is running on correct IP and port
2. Verify API URL in lib/axios.ts matches backend location
3. Check device is on same network as backend
4. Test backend by opening in browser: http://your-ip:5000
5. Check backend logs for errors

### Expo CLI Issues

Problem: "Metro bundler error" or app won't start
Solution:
1. Clear cache: expo start --clear
2. Delete node_modules: rm -rf node_modules
3. Reinstall dependencies: npm install
4. Restart development server: npm start

### AsyncStorage/Keychain Errors

Problem: Cannot read/write secure storage
Solution:
1. Reinstall app on device
2. Clear app data in device settings
3. Restart development server

### Build Failures

Problem: Build fails on eas build
Solution:
1. Clear cache: rm -rf .expo/
2. Update dependencies: npm install
3. Check Node.js version matches requirements
4. Review build logs for specific errors

## Contributing

### Development Workflow

1. Create feature branch: git checkout -b feature/your-feature-name
2. Make changes and test thoroughly
3. Run linter: npm run lint
4. Commit: git commit -am 'Add feature description'
5. Push: git push origin feature/your-feature-name
6. Create Pull Request

### Code Style Guidelines

- Follow TypeScript strict mode
- Use PascalCase for component names
- Use camelCase for function/variable names
- Add comments for complex logic
- Keep components focused and reusable
- Write meaningful commit messages

### Testing Before Commit

- Test on iOS simulator/device
- Test on Android emulator/device
- Verify all accessibility features
- Check language switching works (en/mi)
- Confirm no console errors or warnings


## Support & Contact

For issues or questions:
- Email: thanushkapraveen@ymail.com

## Acknowledgments

- Expo team for development platform
- React Native community
- Google Maps for mapping services
- All contributors and testers

---

Version: 1.0.0
Last Updated: November 2025
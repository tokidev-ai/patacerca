import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Patacerca Paseadores',
  slug: 'patacerca-walkers',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/paseadores-welcome.jpg',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.patacerca.walkers',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#2A2420',
    },
    package: 'com.patacerca.walkers',
    softwareKeyboardLayoutMode: 'resize',
  },
  androidStatusBar: {
    barStyle: 'dark-content',
    backgroundColor: '#F7F2EA',
    translucent: false,
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#2A2420',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Patacerca usa tus fotos para verificar tu identidad como paseador.',
        cameraPermission: 'Patacerca usa la cámara para fotos de carnet y verificación.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});

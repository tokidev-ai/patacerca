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
  ],
  experiments: {
    typedRoutes: true,
  },
});

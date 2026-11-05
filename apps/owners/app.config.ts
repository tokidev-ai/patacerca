import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Patacerca',
  slug: 'patacerca-owners',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/duenos-welcome.jpg',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.patacerca.owners',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#F7F2EA',
    },
    package: 'com.patacerca.owners',
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
        backgroundColor: '#F7F2EA',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Patacerca usa tus fotos para la imagen de tu mascota en el perfil.',
        cameraPermission: 'Patacerca usa la cámara para tomar la foto de tu mascota.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});

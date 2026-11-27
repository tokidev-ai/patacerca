import { existsSync } from 'fs';
import { resolve } from 'path';
import { ExpoConfig, ConfigContext } from 'expo/config';

/** Archivos nativos de Firebase (SMS). Se usan solo si existen, para no romper Expo Go/mock. */
function firebaseFile(envVar: string | undefined, fallback: string): string | undefined {
  const file = envVar ?? fallback;
  return existsSync(resolve(__dirname, file)) ? file : undefined;
}

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
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#F7F2EA',
    },
    package: 'com.patacerca.owners',
    softwareKeyboardLayoutMode: 'resize',
    // Descárgalo de Firebase Console (app Android). No se sube a git.
    googleServicesFile: firebaseFile(
      process.env.GOOGLE_SERVICES_JSON,
      './google-services.json'
    ),
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
    // Windows: compila el C++ nativo en ~/.cxx para no pasar el límite de 260 caracteres.
    '../../plugins/with-short-cxx-path.js',
    // SMS de verificación (Firebase Phone Auth, SDK nativo). Requiere build propia (no Expo Go).
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
        // Firebase Auth 25 viene compilado con Kotlin 2.4; el 2.2 por defecto de Expo no lo lee.
        android: { kotlinVersion: '2.3.0' },
      },
    ],
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

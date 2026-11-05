import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

async function pickFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Fotos', 'Activa el acceso a la galería para subir la imagen.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Cámara', 'Activa la cámara para tomar la foto.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

/** Galería o cámara; devuelve URI local o null si cancela / sin permiso. */
export function pickImageFromLibraryOrCamera(
  title = 'Subir foto'
): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(title, 'Elige una opción', [
      {
        text: 'Galería',
        onPress: () => {
          void pickFromLibrary().then(resolve);
        },
      },
      {
        text: 'Cámara',
        onPress: () => {
          void pickFromCamera().then(resolve);
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

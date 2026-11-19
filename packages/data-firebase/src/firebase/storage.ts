import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';
import { getFirebasePublicConfig, isLocalDeviceUri } from '@patacerca/core';
import { getFirebaseAuth } from './app';

/**
 * Sube una imagen local (file:// o content://) y devuelve su URL https.
 *
 * Se usa la API REST de Firebase Storage con el archivo enviado directo desde disco:
 * el SDK web (uploadBytes/uploadString) crea Blobs a partir de ArrayBuffer, algo que
 * React Native no soporta (archivos vacíos / error "Creating blobs from ArrayBuffer").
 */
export async function uploadLocalImage(
  localUri: string,
  storagePathWithoutExt: string
): Promise<string> {
  const bucket = getFirebasePublicConfig()?.storageBucket;
  if (!bucket) throw new Error('Falta EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');

  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Sesión de Firebase no disponible: cierra sesión y vuelve a entrar');
  }

  // Nombre único: evita que la caché de imágenes muestre una foto vieja.
  const path = `${storagePathWithoutExt}_${Date.now()}.jpg`;
  const encodedPath = encodeURIComponent(path);
  const base = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o`;

  const result = await uploadAsync(`${base}?name=${encodedPath}`, localUri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Firebase ${token}`,
    },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Storage ${result.status}: ${result.body.slice(0, 200)}`);
  }

  const { downloadTokens } = JSON.parse(result.body) as { downloadTokens?: string };
  const tokenParam = downloadTokens ? `&token=${downloadTokens.split(',')[0]}` : '';
  return `${base}/${encodedPath}?alt=media${tokenParam}`;
}

/** Si la URI es local la sube a Storage; si ya es https (o vacía) la devuelve igual. */
export async function ensureRemoteImage(
  uri: string | undefined,
  storagePathWithoutExt: string
): Promise<string | undefined> {
  if (!uri) return undefined;
  if (!isLocalDeviceUri(uri)) return uri;
  return uploadLocalImage(uri, storagePathWithoutExt);
}

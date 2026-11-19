/**
 * Las fotos se suben a Firebase Storage desde los repositorios de data-firebase.
 * La UI puede mostrar file:// local; en Firestore solo se persiste https.
 */

export function sanitizeRemotePhotoUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return undefined;
}

export function isLocalDeviceUri(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith('file://') || url.startsWith('content://');
}

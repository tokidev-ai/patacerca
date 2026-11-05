/**
 * Firebase Storage (fotos mascota, carnet, etc.) queda para una fase posterior (plan Blaze).
 * Mientras tanto: la UI puede mostrar file:// local; al persistir solo guardamos https.
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

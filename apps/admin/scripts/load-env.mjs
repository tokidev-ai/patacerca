// Lee apps/admin/.env (o variables de entorno) y devuelve la configuración web de Firebase.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const adminRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = resolve(adminRoot, '.env');

/** Parser mínimo de .env: KEY=VALUE, ignora comentarios y comillas. */
function parseEnv(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
    result[key] = value;
  }
  return result;
}

export const envFileExists = existsSync(envFile);
const fileVars = envFileExists ? parseEnv(readFileSync(envFile, 'utf8')) : {};
const vars = { ...fileVars, ...process.env };

// Acepta FIREBASE_* o los nombres de las apps móviles (EXPO_PUBLIC_FIREBASE_*).
const get = (name) => (vars[name] ?? vars[`EXPO_PUBLIC_${name}`] ?? '').trim();

export const firebaseConfig = {
  apiKey: get('FIREBASE_API_KEY'),
  authDomain: get('FIREBASE_AUTH_DOMAIN'),
  projectId: get('FIREBASE_PROJECT_ID'),
  storageBucket: get('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: get('FIREBASE_APP_ID'),
};

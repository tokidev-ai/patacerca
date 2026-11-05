/**
 * Carga datos de demo en Firestore (mismos seeds que @patacerca/data-mock).
 *
 * Uso (desde patacerca/):
 *   npx tsx packages/data-firebase/scripts/seed-firestore.ts
 *   npx tsx packages/data-firebase/scripts/seed-firestore.ts --env apps/walkers/.env
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  getFirebasePublicConfig,
  isFirebaseConfigured,
} from '@patacerca/core';
import { INITIAL_WALKERS, INITIAL_REQUESTS, INITIAL_OWNERS } from '@patacerca/data-mock';
import {
  walkerToDocument,
  walkRequestToDocument,
  ownerToDocument,
} from '../src/firebase/mappers';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(scriptDir, '../../..');

function loadEnvFile(envPath: string): void {
  if (!existsSync(envPath)) {
    throw new Error(`No existe el archivo env: ${envPath}`);
  }
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(): { envPath: string; skipExisting: boolean } {
  const args = process.argv.slice(2);
  let envPath = resolve(monorepoRoot, 'apps/owners/.env');
  let skipExisting = true;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) {
      envPath = resolve(monorepoRoot, args[i + 1]!);
      i++;
    } else if (args[i] === '--force') {
      skipExisting = false;
    }
  }
  return { envPath, skipExisting };
}

async function seedCollection(
  db: ReturnType<typeof getFirestore>,
  label: string,
  items: { id: string; collection: string; payload: Record<string, unknown> }[],
  skipExisting: boolean
): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;
  for (const item of items) {
    const ref = doc(db, item.collection, item.id);
    if (skipExisting) {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        skipped++;
        continue;
      }
    }
    await setDoc(ref, item.payload, { merge: true });
    written++;
  }
  console.log(`  ${label}: ${written} escritos, ${skipped} ya existían (omitidos)`);
  return { written, skipped };
}

async function main(): Promise<void> {
  const { envPath, skipExisting } = parseArgs();
  loadEnvFile(envPath);

  if (!isFirebaseConfigured()) {
    console.error(
      'Firebase no configurado en el .env. Define EXPO_PUBLIC_FIREBASE_* (ver docs/FIREBASE.md).'
    );
    process.exit(1);
  }

  const config = getFirebasePublicConfig()!;
  const app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  const db = getFirestore(app);

  console.log(`Proyecto: ${config.projectId}`);
  console.log(`Env: ${envPath}`);
  console.log(
    skipExisting
      ? 'Modo: no sobrescribe docs existentes (--force para sobrescribir)'
      : 'Modo: --force (merge en todos)'
  );

  const walkerItems = INITIAL_WALKERS.map((w) => ({
    id: w.id,
    collection: FS_COLLECTIONS.walkers,
    payload: walkerToDocument(w) as unknown as Record<string, unknown>,
  }));

  const ownerItems = INITIAL_OWNERS.map((o) => ({
    id: o.phone,
    collection: FS_COLLECTIONS.owners,
    payload: ownerToDocument(o) as unknown as Record<string, unknown>,
  }));

  const requestItems = INITIAL_REQUESTS.map((r) => ({
    id: r.id,
    collection: FS_COLLECTIONS.walkRequests,
    payload: walkRequestToDocument(r) as unknown as Record<string, unknown>,
  }));

  console.log('Sembrando Firestore…');
  const w = await seedCollection(db, 'walkers (approved)', walkerItems, skipExisting);
  const o = await seedCollection(db, 'owners', ownerItems, skipExisting);
  const r = await seedCollection(db, 'walkRequests', requestItems, skipExisting);

  const totalWritten = w.written + o.written + r.written;
  console.log(`\nListo. ${totalWritten} documentos nuevos.`);
  console.log(
    'Prueba: app owners con USE_MOCK_DATA=false → buscar paseadores (7 approved).'
  );
  console.log(
    'Login demo dueño: 70000001 + OTP (Firestore otpSessions o EXPO_PUBLIC_OTP_FIXED_CODE).'
  );
  console.log('Login demo paseador w1: 71110001 en app walkers.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

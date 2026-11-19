// Genera src/environments/environment.ts a partir de apps/admin/.env (o variables de entorno).
// Angular no lee .env por sí solo; este script corre antes de start / build / typecheck.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { adminRoot, envFileExists, firebaseConfig } from './load-env.mjs';

const outFile = resolve(adminRoot, 'src/environments/environment.ts');

const content = `// ARCHIVO GENERADO por scripts/generate-env.mjs desde .env — no lo edites ni lo subas a git.
export const environment = {
  firebase: ${JSON.stringify(firebaseConfig, null, 2).replace(/\n/g, '\n  ')},
};
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, content);

if (!envFileExists) {
  console.warn('[admin] No existe apps/admin/.env: copia .env.example a .env y complétalo.');
} else if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('[admin] Faltan valores de Firebase en apps/admin/.env.');
}

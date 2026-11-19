# Firebase — Patacerca

Arquitectura de datos en el monorepo: **interfaces en `@patacerca/core`**, implementaciones **mock** (`@patacerca/data-mock`) y **Firebase** (`@patacerca/data-firebase`).

## Conmutador mock / Firebase

| Variable | Valores | Efecto |
|----------|---------|--------|
| `EXPO_PUBLIC_USE_MOCK_DATA` | `true` (default) / `false` | Mock local vs Firestore |
| `EXPO_PUBLIC_APP_ROLE` | `owner` / `walker` | Rol al guardar OTP en `otpSessions` |

Cada app lee su `.env` en `apps/owners/.env` o `apps/walkers/.env` (copia desde [`.env.example`](../.env.example)).

Si `USE_MOCK_DATA=false` pero faltan variables Firebase, la app **vuelve a mock** y escribe un warning en consola.

## Variables Firebase (obligatorias con mock=false)

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

Creación: [Firebase Console](https://console.firebase.google.com) → Proyecto → Configuración → Tus apps → Web.

## Login con correo y contraseña

Usa **Firebase Authentication** (proveedor *Correo electrónico/contraseña*: actívalo en Firebase Console → Authentication → Sign-in method). Al registrarse se crea el usuario en Auth y `userAccounts/{uid}`; la contraseña nunca se guarda en Firestore. Las reglas deben permitir a cada usuario autenticado escribir/leer solo su propio `userAccounts/{uid}`.

## OTP sin WhatsApp (fase actual, solo registro)

1. Usuario pide código en la app.
2. Se escribe/actualiza `otpSessions/{phone8}` con `{ code, expiresAt, role, createdAt }`.
3. **Tú lees el código** en Firestore Console (colección `otpSessions`) y lo ingresas en la app.
4. Opcional: `EXPO_PUBLIC_OTP_FIXED_CODE=1234` para no depender del aleatorio.

WhatsApp Business / Cloud API irá en un **Cloud Function** que reemplace la escritura manual del OTP (documentado, no implementado).

## Schema Firestore

Definición TypeScript: `packages/core/src/firestore/`.

| Colección | Doc ID | Contenido |
|-----------|--------|-----------|
| `owners` | teléfono 8 dígitos | Perfil dueño + `pets[]` |
| `walkers` | `walker.id` | Perfil paseador + `status` |
| `walkRequests` | `req_{timestamp}` | Solicitudes de paseo |
| `verifications` | `walkerId` | Pasos KYC (flags + `interviewSlot`) |
| `otpSessions` | teléfono 8 dígitos | Código de verificación del registro |
| `userAccounts` | `uid` de Firebase Auth | `{ email, phone, role }` — enlaza el login por correo con el perfil |
| `chatThreads` | `{ownerPhone}_{walkerId}` | Chat (fase 2; hoy mock en Firebase mode) |

### Índices compuestos sugeridos

En Firebase Console → Firestore → Índices, si lo pide la consola:

- `walkRequests`: `ownerPhone` + `createdAt` (desc)
- `walkRequests`: `walkerId` + `createdAt` (desc)
- `walkers`: `phone` (equality) — login paseador

### Reglas de seguridad (borrador)

Archivo de referencia: [`firestore.rules.example`](./firestore.rules.example).  
**Producción:** restringir lectura/escritura por Auth UID o Cloud Functions; las reglas abiertas son solo para desarrollo temprano.

## Imágenes y Storage

Las fotos se suben a **Firebase Storage** desde los repositorios de `data-firebase` (las pantallas solo pasan la URI local). En Firestore solo se guarda la URL `https` (`sanitizeRemotePhotoUrl`).

| Foto | Ruta en Storage | Campo |
|------|-----------------|-------|
| Perfil dueño | `owners/{phone}/avatar_*.jpg` | `owners/{phone}.photoUrl` |
| Mascota | `owners/{phone}/pets/{petId}_*.jpg` | `pets[].photoUrl` |
| Perfil paseador (de frente) | `walkers/{walkerId}/avatar_*.jpg` | `walkers/{id}.photoUrl` |
| Carnet anverso/reverso, selfie, antecedentes | `verifications/{walkerId}/{idFront\|idBack\|selfie\|policeRecord}_*.jpg` | `verifications/{id}.idFrontPhoto`, `idBackPhoto`, `selfiePhoto`, `policeRecordPhoto` |

- Activa **Storage** en Firebase Console (Build → Storage → Comenzar) y publica reglas basadas en [`storage.rules.example`](./storage.rules.example). Los documentos de `verifications/` son sensibles: restringe su lectura antes de producción.
- En modo mock las fotos quedan como URI local en AsyncStorage (sin subir nada).

## Seed de datos de prueba (Firestore)

Tras crear Firestore y pegar el `.env`:

```bash
cd patacerca
npm install
npm run seed:firestore
```

Usa `apps/owners/.env` por defecto. Otro archivo:

```bash
npx tsx packages/data-firebase/scripts/seed-firestore.ts --env apps/walkers/.env
```

Sobrescribir/actualizar todo (merge):

```bash
npm run seed:firestore -- --force
```

Carga:

| Colección | Cantidad | Notas |
|-----------|----------|--------|
| `walkers` | 7 | `status: approved` (ids `w1`…`w7`, teléfonos `71110001`…) |
| `owners` | 3 | `70000001`…`70000003` |
| `walkRequests` | 3 | Solicitudes demo para paseador `w1` |

Por defecto **no pisa** documentos que ya existan; usa `--force` para volver a escribir.

Si el seed falla con **`permission-denied`**, publica reglas de desarrollo: Firestore → **Rules** → pega [`firestore.rules.example`](./firestore.rules.example) → **Publish** → vuelve a ejecutar `npm run seed:firestore`.

## Flujo completo recomendado (Firebase)

1. `EXPO_PUBLIC_USE_MOCK_DATA=false` + variables Firebase en ambas apps.
2. `npm run seed:firestore` (opcional pero recomendado para ver paseadores en búsqueda).
2. Owners: registro → `owners/{phone}`.
3. Walkers: registro → `walkers/{id}` + verificación en `verifications/{id}`.
4. OTP: mirar `otpSessions` → verificar → sesión en AsyncStorage (igual que mock).
5. Dueño busca paseadores con `status == approved` en `walkers`.
6. Crear paseo → `walkRequests`.

## Paquetes

```
packages/core/src/firestore/     # schema + colecciones
packages/data-mock/              # AsyncStorage
packages/data-firebase/          # Firestore + factory createOwnerRepositories / createWalkerRepositories
apps/*/src/providers/DataProvider.tsx
```

Tras cambios: `npm run check` desde `patacerca/`.

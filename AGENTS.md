# AGENTS.md — Patacerca Mobile

Guía para agentes de código. **Raíz del repositorio GitHub: esta carpeta (`patacerca/`).**

## Mapa del repositorio

```
patacerca/                    # ← repo GitHub (npm workspaces)
├── .cursor/rules/            # Reglas Cursor
├── .cursorignore             # Exclusiones para indexación del agente
├── AGENTS.md                 # Este archivo
├── CLAUDE.md                 # Agente dedicado (Claude Code)
├── README.md                 # Arquitectura y features
├── apps/owners/              # App dueños (com.patacerca.owners)
├── apps/walkers/             # App paseadores (com.patacerca.walkers)
└── packages/
    ├── ui/                   # Componentes compartidos
    ├── core/                 # Modelos, Zod, strings, reglas
    ├── theme/                # Tokens de diseño
    ├── data-mock/            # Repositorios mock (AsyncStorage)
    └── data-firebase/        # Firestore + factory mock/Firebase
```

Si abres el workspace **`patacerca-app/`** (carpeta padre), la documentación canónica sigue estando aquí en **`patacerca/`**.

## Verificación obligatoria tras cada cambio

Antes de dar por terminado un cambio (y **antes de generar APK / build de release**), ejecutar desde **`patacerca/`**:

```bash
npm run check
```

Eso corre en cadena:

| Paso    | Comando                | Qué valida                                               |
| ------- | ---------------------- | -------------------------------------------------------- |
| Tipos   | `npm run typecheck`    | TypeScript en apps + packages (fallos que rompen bundle) |
| Formato | `npm run format:check` | Prettier (“print”) — estilo consistente                  |
| Lint    | `npm run lint`         | ESLint (`eslint-config-expo`)                            |

Si algo falla, corregir y volver a ejecutar **`npm run check`**.

Atajos:

```bash
npm run format          # aplicar Prettier (auto-fix print)
npm run typecheck       # solo tipos
npm run lint            # solo ESLint
```

El CI en GitHub (`.github/workflows/ci.yml`) ejecuta **`npm run check`** en cada push/PR a `main`.

## Responsabilidades por app

| App         | Usuario        | Flujos clave                                                                  |
| ----------- | -------------- | ----------------------------------------------------------------------------- |
| **owners**  | Dueño de perro | Auth WhatsApp → onboarding perro → buscar paseadores → solicitar paseo → chat |
| **walkers** | Paseador       | Auth → onboarding → verificación 4 pasos → solicitudes → perfil               |

Cada app es **independiente**: su `app/`, `src/features/`, stores y `app.config.ts`.

## Patrón UI: formularios con CTA fijo

1. **`FormScreenLayout`** (`packages/ui/src/components/FormScreenLayout.tsx`)
2. **`keyboardAvoidingBehavior`** (`packages/ui/src/keyboard.ts`) para chat/modales
3. **Android** `softwareKeyboardLayoutMode: 'resize'` en cada `app.config.ts`

## Features (`src/features/`)

- `auth/screens/` — Welcome, Phone, Code, Onboarding
- owners: `search`, `walker-detail`, `requests`, `chat`, `profile`
- walkers: `inbox`, `verification`, `profile`, `chat`

## Estado y datos

- `session.store.ts` — sesión
- `DataProvider` / `useData()` / `useWalkerData()` — `createOwnerRepositories()` / `createWalkerRepositories()` (`@patacerca/data-firebase`)
- **`EXPO_PUBLIC_USE_MOCK_DATA=true`** (default) → `@patacerca/data-mock`; **`false`** → Firestore
- Schema Firestore: `packages/core/src/firestore/` — guía [`docs/FIREBASE.md`](./docs/FIREBASE.md)
- TanStack Query para datos remotos

## Secretos y archivos sensibles

**No leer, indexar ni commitear:** `.env`, `.env.*`, `*.pem`, `credentials.json`, claves API. Están en `.gitignore` y `.cursorignore`.

## Desarrollo local

```bash
npm install
npm run owners   # 8081
npm run walkers  # 8082
```

OTP de prueba: **1234**. Teléfonos Bolivia: 8 dígitos, +591.

## Selección vs filtros

- Zonas / listas largas en UI: **`SearchableOptionSelect`** / **`SearchableOptionSelectMulti`** (campo compacto → sheet con buscador). **`SearchableOptionList`** solo dentro del sheet o casos excepcionales.
- **`Chip` horizontal**: filtros cortos (disponible hoy, tamaño del perro, días/horarios con pocas opciones).

## Iconos de UI

- No usar **emojis** como iconos (cámara, check, etc.).
- Usar **`AppIcon`** (`packages/ui/src/components/AppIcon.tsx`, Feather) con hex del DS: `#3E8E5E`, `#2F6E48`, `#2A2420`, `#6B6058`.
- WhatsApp mantiene su verde en `WhatsAppButton`.

## Extensiones habituales

- Formulario + botón abajo → `FormScreenLayout`
- UI reutilizable → `packages/ui`
- Validación / tipos → `packages/core`
- Mock data → `packages/data-mock`

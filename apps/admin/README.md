# Patacerca Admin (Angular)

Panel web para que el administrador vea las **solicitudes de verificación** de paseadores, las revise y **apruebe**. Incluye un dashboard con el resumen.

Stack: Angular 20 (standalone + signals) · Tailwind CSS 4 · Firebase (Auth + Firestore).

## Puesta en marcha

1. Copia `apps/admin/.env.example` a `apps/admin/.env` y complétalo:
   - `FIREBASE_*`: configuración web del **mismo proyecto** que usan las apps móviles (puedes copiar los valores de `apps/owners/.env`, que allí se llaman `EXPO_PUBLIC_FIREBASE_*`, o de Firebase Console → Configuración del proyecto → Tus apps → Web).
   - `ADMIN_EMAILS`: correos con permiso para entrar (separados por coma).
2. Crea esos usuarios en Firebase Console → Authentication → Users → Add user.
3. Desde la raíz del monorepo: `npm run admin` → http://localhost:8083

Angular no lee `.env` por sí solo: `scripts/generate-env.mjs` lo convierte en `src/environments/environment.ts` (archivo generado e ignorado por git) antes de `start`, `build` y `typecheck`. Si cambias el `.env`, reinicia `npm run admin`.

```bash
npm run admin                                # servidor de desarrollo (8083)
npm --workspace=@patacerca/admin run build   # build de producción en apps/admin/dist
```

## Estructura

```
src/app/
├── core/        # lógica y datos (sin UI): firebase, auth, guards, walkers.service, modelos
├── shared/ui/   # componentes de presentación reutilizables (avatar, status-pill, stat-card)
└── features/    # pantallas; cada una con su .ts (lógica) y su .html (UI con Tailwind)
    ├── auth/login
    ├── layout/shell
    ├── dashboard
    └── requests (lista + detalle con "Aprobar")
```

- **Lógica** en `.ts` (signals, `computed`, servicios) y **UI** en `.html`; los componentes de `shared/ui` solo reciben `input()`.
- Los estilos son utilidades de Tailwind; los colores y fuentes de Patacerca están en `src/styles.css` (`@theme`).

## Cómo funciona la aprobación

- Un paseador queda **En revisión** cuando envía los 4 pasos de verificación desde la app de walkers.
- El panel escucha `walkers` en tiempo real. Al pulsar **Aprobar**, escribe `walkers/{id}.status = 'approved'`; la app del paseador y las búsquedas de los dueños ya leen ese campo.
- Las fotos de los documentos salen de `verifications/{id}` (`idFrontPhoto`, `idBackPhoto`, `selfiePhoto`, `policeRecordPhoto`).

## Seguridad (importante)

La lista `adminEmails` solo restringe la pantalla; **no protege los datos**. Antes de producción, las reglas de Firestore y Storage deben permitir la lectura de `verifications/` y la escritura del campo `status` solo a administradores (por ejemplo con un _custom claim_ `admin`). Ver `docs/FIREBASE.md`.

> Los tipos de `src/app/core/models.ts` espejan `packages/core/src/firestore/documents.ts` (se duplican a propósito: Angular no compila los paquetes de React Native). Si cambias esos documentos, actualiza también este archivo.

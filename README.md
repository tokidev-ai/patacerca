# Patacerca — Monorepo de Apps Móviles

Monorepo con las dos aplicaciones móviles nativas para la plataforma **Patacerca** (Cochabamba, Bolivia):
1. **Dueños (`apps/owners`)**: Encuentra paseadores verificados cerca de tu barrio, solicita paseos y coordina.
2. **Paseadores (`apps/walkers`)**: Registro y verificación de 4 pasos, gestión de solicitudes de paseo y perfil.

Ambas aplicaciones están desarrolladas con **React Native + Expo SDK 58**, **Expo Router**, **TypeScript estricto**, **Zustand** y **TanStack Query**.

---

## 1. Estructura del Monorepo

```
patacerca/
├── apps/
│   ├── owners/                  # App de Dueños (com.patacerca.owners)
│   │   ├── app/                 # Rutas de Expo Router
│   │   ├── src/
│   │   │   ├── features/        # auth, search, walker-detail, requests, chat, profile
│   │   │   ├── providers/       # DataProvider, QueryProvider, ToastProvider
│   │   │   └── store/           # Zustand stores (session, toast)
│   │   └── assets/              # Fotografías oficiales del diseño
│   │
│   └── walkers/                 # App de Paseadores (com.patacerca.walkers)
│       ├── app/                 # Rutas de Expo Router
│       ├── src/
│       │   ├── features/        # auth, inbox, verification, profile, chat
│       │   ├── providers/       # DataProvider, QueryProvider, ToastProvider
│       │   └── store/           # Zustand stores (session, toast)
│       └── assets/              # Fotografías oficiales del diseño
│
├── packages/
│   ├── theme/                   # Tokens, paleta de colores, tipografías y preset Tailwind
│   ├── core/                    # Modelos, esquemas Zod, constantes, reglas de negocio e interfaces de repositorio
│   ├── ui/                      # Componentes visuales compartidos (Button, Card, Avatar, Toast, etc.)
│   └── data-mock/               # Repositorios mockeados (AsyncStorage + semillas)
│
├── .github/workflows/ci.yml     # Validación en CI (lint, typecheck)
└── package.json                 # Workspaces y scripts raíz
```

---

## 2. Principios de Arquitectura e Independencia

- **Independencia de Apps**: Cada app (`owners` y `walkers`) tiene su propio `package.json`, su propia configuración de Expo (`app.config.ts`), sus propias pantallas y su lógica de estado. Modificar una app no afecta a la otra.
- **Capa de Repositorios**: Toda la comunicación de datos se realiza a través de interfaces (`IAuthRepository`, `IWalkersRepository`, `IRequestsRepository`, etc.). Cambiar de datos mock a **Firebase** se logra implementando `packages/data-firebase` y sustituyendo el `DataProvider` de la app sin modificar ninguna pantalla.
- **Tokens y Diseño**: Sistema de diseño 100% fiel al prototipo oficial (colores `#F7F2EA`, `#FFFCF7`, `#3E8E5E`, `#2A2420`, tipografías Bricolage Grotesque y Figtree).

---

## 3. Funcionalidades Implementadas

### App de Dueños
- **Bienvenida y Autenticación**: Login con WhatsApp (+591, 8 dígitos), código OTP de prueba (`1234`).
- **Onboarding**: Nombre, zona en Cochabamba (13 zonas) y datos del perro (tamaño).
- **Explorador y Filtros**: Búsqueda por zona, filtros ("Disponible hoy", "Perros grandes", "Cuida en viajes", "Hasta 20 Bs").
- **Detalle de Paseador**: Tarjetas de precio (30 y 60 min con fórmula `min(50, round(price30 * 1.6))`), bloque de 4 verificaciones y reseñas.
- **Solicitud de Paseo**: Modal inferior con duración, selector de día, grilla de horas y cálculo de total.
- **Mis Paseos**: Lista con estados ("Esperando respuesta", "Aceptada", "No disponible", "Cancelada", "Completado").
- **Cierre y Calificación (de la reunión)**: Calificación del paseador (1 a 5 estrellas + reseña) tras finalizar el paseo.
- **Chat**: Mensajería con respuesta automática del paseador a los 1.8 segundos y acceso directo a WhatsApp.
- **Múltiples Mascotas (de la reunión)**: Posibilidad de agregar más de un perrito desde el perfil.

### App de Paseadores
- **Bienvenida Oscura**: Interfaz oscura (`#2A2420`) orientada al paseador.
- **Verificación de 4 Pasos**:
  1. Identidad (Carnet anverso, reverso y selfie).
  2. Antecedentes (Certificado vigente).
  3. Referencias (2 personas con números válidos).
  4. Entrevista (Grilla de horarios de videollamada de 15 min).
- **Gestión de Solicitudes**: Segmentos Nuevas / Aceptadas / Historial. Aceptar/rechazar solicitudes y marcar paseos como completados.
- **Simulador de Aprobación**: Permite aprobar la cuenta para pruebas del prototipo.
- **Perfil de Paseador**: Bio, stepper de precios (15 a 30 Bs con cálculo automático de 60 min), selector multizona y días.
- **Vista Previa**: Modal "¿Cómo te ven los dueños?".

---

## 4. Instalación y Ejecución

Desde la carpeta raíz `patacerca/`:

```bash
# Instalar dependencias del monorepo
npm install

# Iniciar la App de Dueños
npm run owners

# Iniciar la App de Paseadores
npm run walkers
```


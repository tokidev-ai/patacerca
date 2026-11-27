/**
 * Plugin de Expo (solo builds locales en Windows): evita el límite de 260 caracteres al
 * compilar el C++ nativo (worklets, reanimated, codegen…).
 *
 * - Usa CMake 3.31.6 del Android SDK: trae ninja 1.12, que sí soporta rutas largas
 *   (el CMake 3.22 por defecto trae ninja 1.10 y falla con "Filename longer than 260").
 *   Instálalo en Android Studio → SDK Manager → SDK Tools → CMake 3.31.6.
 * - Compila las librerías en una carpeta corta (C:\cxx\<código>) en vez de
 *   node_modules/<lib>/android/.cxx, para tener más margen.
 *
 * Requiere además LongPathsEnabled=1 en Windows (ya activo en esta PC).
 */
const { withAppBuildGradle, withProjectBuildGradle } = require('expo/config-plugins');

const CMAKE_VERSION = '3.31.6';
const MARKER = '// patacerca: windows-native-build';

const SNIPPET = `
${MARKER}
subprojects { sub ->
  if (!System.getProperty('os.name').toLowerCase().contains('windows')) return
  sub.plugins.withId('com.android.library') {
    sub.android.externalNativeBuild.cmake.version = '${CMAKE_VERSION}'
    // Código corto por app + librería: CMake mete la ruta absoluta del fuente dentro de la
    // carpeta de objetos, así que cada carácter cuenta.
    def key = Integer.toString(Math.abs((rootProject.name + sub.name).hashCode()), 36)
    sub.android.externalNativeBuild.cmake.buildStagingDirectory = file("C:/cxx/\${key}")
  }
}
`;

// El módulo app se configura antes que el root: su versión de CMake va en app/build.gradle.
const APP_SNIPPET = `android {
    ${MARKER}
    if (System.getProperty('os.name').toLowerCase().contains('windows')) {
        externalNativeBuild { cmake { version '${CMAKE_VERSION}' } }
    }`;

module.exports = function withWindowsNativeBuild(config) {
  config = withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SNIPPET;
    }
    return cfg;
  });
  return withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /^android \{/m,
        APP_SNIPPET
      );
    }
    return cfg;
  });
};

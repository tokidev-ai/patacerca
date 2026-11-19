// Crea (o promueve) un administrador en Firebase.
//
//   npm run admin:create -- correo@ejemplo.com            -> genera una contraseña y la imprime
//   npm run admin:create -- correo@ejemplo.com MiClave123 -> usa esa contraseña
//
// Hace dos cosas: crea el usuario en Firebase Authentication (correo + contraseña) y escribe
// `userAccounts/{uid}` con `role: 'admin'`, que es lo que el panel consulta para dejarlo entrar.
// Si el correo ya existe en Authentication, pasa su contraseña como segundo argumento.
import { randomBytes } from 'node:crypto';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './load-env.mjs';

function fail(message) {
  console.error(`\n[create-admin] ${message}\n`);
  process.exit(1);
}

const [emailArg, passwordArg] = process.argv.slice(2);
const email = (emailArg ?? '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  fail('Uso: npm run admin:create -- correo@ejemplo.com [contraseña]');
}
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  fail('Faltan los valores FIREBASE_* en apps/admin/.env (copia .env.example a .env).');
}
if (passwordArg && passwordArg.length < 6) {
  fail('La contraseña debe tener al menos 6 caracteres.');
}

const generated = !passwordArg;
const password = passwordArg ?? randomBytes(9).toString('base64url');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  let uid;
  let created = false;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    created = true;
  } catch (e) {
    if (e?.code !== 'auth/email-already-in-use') throw e;
    if (generated) {
      fail('Ese correo ya existe en Authentication. Pasa su contraseña como segundo argumento.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
  }

  const ref = doc(db, 'userAccounts', uid);
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data().role && existing.data().role !== 'admin') {
    fail(
      `Ese correo ya es una cuenta de ${existing.data().role} en la app. Usa otro correo para el admin.`,
    );
  }
  await setDoc(ref, { email, phone: '', role: 'admin', createdAt: Date.now() }, { merge: true });

  console.log(`\n[create-admin] Listo: ${email} es administrador.`);
  if (created && generated) console.log(`[create-admin] Contraseña generada: ${password}`);
  if (created && !generated)
    console.log('[create-admin] Usuario creado con la contraseña indicada.');
  if (!created) console.log('[create-admin] El usuario ya existía; ahora tiene rol admin.');
  console.log('[create-admin] Entra en http://localhost:8083 con ese correo y contraseña.\n');
  process.exit(0);
} catch (e) {
  const code = e?.code ?? '';
  const hints = {
    'auth/configuration-not-found': 'Activa Authentication en Firebase Console (Comenzar).',
    'auth/operation-not-allowed': 'Activa el proveedor Correo/contraseña en Authentication.',
    'auth/invalid-credential': 'La contraseña no coincide con la de ese usuario existente.',
    'auth/weak-password': 'Elige una contraseña más larga (mínimo 6 caracteres).',
    'permission-denied': 'Las reglas de Firestore no permiten escribir userAccounts.',
  };
  fail(`${code || 'Error'}: ${hints[code] ?? e?.message ?? e}`);
}

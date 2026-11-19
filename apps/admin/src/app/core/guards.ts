import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Nota: inject() solo funciona antes del primer `await`, por eso las dependencias se
// obtienen al inicio de cada guard.

/** Solo deja pasar a admins con sesión iniciada. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady;
  return auth.isAdmin() ? true : router.createUrlTree(['/login']);
};

/** Si ya hay sesión de admin, /login redirige al dashboard. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady;
  return auth.isAdmin() ? router.createUrlTree(['/dashboard']) : true;
};

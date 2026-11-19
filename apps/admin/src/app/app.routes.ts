import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./features/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'solicitudes/:id',
        loadComponent: () =>
          import('./features/requests/request-detail/request-detail').then((m) => m.RequestDetail),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

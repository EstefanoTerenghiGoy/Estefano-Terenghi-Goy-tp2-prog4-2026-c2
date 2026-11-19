import { Routes } from '@angular/router';
import { autenticadoGuard, invitadoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Al abrir la app se pasa por la pantalla de cargando, que valida el token con el back
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: '',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'publicaciones',
        loadComponent: () =>
          import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'publicaciones/:id',
        loadComponent: () =>
          import('./pages/publicacion-detalle/publicacion-detalle').then(
            (m) => m.PublicacionDetalle,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },
  { path: '**', redirectTo: 'cargando' },
];

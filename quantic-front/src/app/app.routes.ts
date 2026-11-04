import { Routes } from '@angular/router';

// loadComponent: cada página se descarga recién cuando se entra a su ruta (lazy loading)
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  { path: 
    'perfil', 
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const autenticadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaLogueado() ? true : router.createUrlTree(['/login']);
};

// Dashboard: solo administradores; el resto vuelve a publicaciones (el back igual valida el rol)
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.esAdmin() ? true : router.createUrlTree(['/publicaciones']);
};

export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaLogueado() ? router.createUrlTree(['/publicaciones']) : true;
};

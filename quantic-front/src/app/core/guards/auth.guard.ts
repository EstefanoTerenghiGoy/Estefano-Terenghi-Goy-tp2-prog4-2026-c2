import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Páginas privadas: sin token, al login
export const autenticadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaLogueado() ? true : router.createUrlTree(['/login']);
};

// Login y registro: con token ya iniciada la sesión, a publicaciones
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaLogueado() ? router.createUrlTree(['/publicaciones']) : true;
};

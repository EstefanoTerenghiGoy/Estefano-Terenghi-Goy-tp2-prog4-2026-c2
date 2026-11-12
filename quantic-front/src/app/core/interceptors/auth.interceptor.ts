import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const RUTAS_SIN_REDIRECCION = ['/auth/login', '/auth/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken();
  const peticion =
    token && req.url.startsWith(environment.apiUrl)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      const esRutaDeAuth = RUTAS_SIN_REDIRECCION.some((ruta) => req.url.includes(ruta));
      if (error instanceof HttpErrorResponse && error.status === 401 && !esRutaDeAuth) {
        authService.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};

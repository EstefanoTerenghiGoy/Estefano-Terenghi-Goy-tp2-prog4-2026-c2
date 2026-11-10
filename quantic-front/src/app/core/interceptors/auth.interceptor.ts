import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// En login y registro un 401 significa "credenciales incorrectas": lo muestra el modal
const RUTAS_SIN_REDIRECCION = ['/auth/login', '/auth/registro'];

// Único lugar donde se usa RxJS (catchError/throwError): los interceptores lo exigen
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // El token solo se manda a nuestra API, nunca a otros sitios (por ejemplo Cloudinary)
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
      return throwError(() => error); // el error sigue su camino hacia quien hizo el pedido
    }),
  );
};

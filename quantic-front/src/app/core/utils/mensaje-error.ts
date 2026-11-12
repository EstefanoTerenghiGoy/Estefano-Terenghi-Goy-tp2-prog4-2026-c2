import { HttpErrorResponse } from '@angular/common/http';

// Un 401 en una pantalla con sesión significa token inválido o vencido: el interceptor ya cerró
// la sesión y redirigió a /login, así que no hay que mostrar además un modal de error
export function esSesionVencida(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}

export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Probá de nuevo en un rato.';
    }
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }
    if (typeof mensaje === 'string') {
      return mensaje;
    }
  }
  return porDefecto;
}

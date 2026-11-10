import { HttpErrorResponse } from '@angular/common/http';

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

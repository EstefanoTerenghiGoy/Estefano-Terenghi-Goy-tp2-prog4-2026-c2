import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EstadoMeGusta,
  OrdenPublicaciones,
  Publicacion,
  RespuestaPublicaciones,
} from '../../shared/models/publicacion';
import { esSesionVencida, mensajeDeError } from '../utils/mensaje-error';
import { ModalService } from './modal.service';

// Resultado de confirmarYEliminar()
export type ResultadoEliminar = 'eliminada' | 'cancelada' | 'inexistente' | 'error';

@Service()
export class PublicacionesService {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private url = `${environment.apiUrl}/publicaciones`;

  // El token lo agrega el interceptor
  listar(opciones: {
    orden: OrdenPublicaciones;
    offset: number;
    limit: number;
    usuarioId?: string; // si se pasa, solo las publicaciones de ese usuario
  }): Promise<RespuestaPublicaciones> {
    const params: Record<string, string | number> = {
      orden: opciones.orden,
      offset: opciones.offset,
      limit: opciones.limit,
    };
    if (opciones.usuarioId) {
      params['usuarioId'] = opciones.usuarioId;
    }
    return firstValueFrom(this.http.get<RespuestaPublicaciones>(this.url, { params }));
  }

  // 404 si no existe o está dada de baja
  obtenerPorId(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.get<Publicacion>(`${this.url}/${id}`));
  }

  // FormData con titulo, descripcion y (opcional) el archivo en el campo "imagen"
  crear(formData: FormData): Promise<Publicacion> {
    return firstValueFrom(this.http.post<Publicacion>(this.url, formData));
  }

  eliminar(id: string): Promise<{ mensaje: string }> {
    return firstValueFrom(this.http.delete<{ mensaje: string }>(`${this.url}/${id}`));
  }

  darMeGusta(id: string): Promise<EstadoMeGusta> {
    return firstValueFrom(this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {}));
  }

  quitarMeGusta(id: string): Promise<EstadoMeGusta> {
    return firstValueFrom(this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`));
  }

  // Lo comparten el listado y el detalle. Da o quita el me gusta según el estado actual.
  // Devuelve el estado nuevo, 'conflicto' si el servidor ya lo tenía así (409: conviene volver a
  // pedir la publicación para sincronizar) o null si falló (ya se mostró el modal de error).
  async alternarMeGusta(publicacion: Publicacion): Promise<EstadoMeGusta | 'conflicto' | null> {
    try {
      return publicacion.meGustaMio
        ? await this.quitarMeGusta(publicacion._id)
        : await this.darMeGusta(publicacion._id);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        return 'conflicto';
      }
      this.mostrarError('No se pudo actualizar el me gusta', error);
      return null;
    }
  }

  // Lo comparten el listado y el detalle. Pide confirmación y, si se acepta, elimina. Los errores
  // (403, 404, etc.) se muestran en el modal de error.
  async confirmarYEliminar(publicacion: Publicacion): Promise<ResultadoEliminar> {
    const confirmo = await this.modalService.confirmar(
      'Eliminar entrada',
      `¿Seguro que querés eliminar «${publicacion.titulo}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmo) {
      return 'cancelada';
    }
    try {
      await this.eliminar(publicacion._id);
      return 'eliminada';
    } catch (error) {
      this.mostrarError('No se pudo eliminar la entrada', error);
      return error instanceof HttpErrorResponse && error.status === 404 ? 'inexistente' : 'error';
    }
  }

  private mostrarError(titulo: string, error: unknown): void {
    if (esSesionVencida(error)) {
      return; // el interceptor ya te mandó al login
    }
    this.modalService.mostrarError(
      titulo,
      mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
    );
  }
}

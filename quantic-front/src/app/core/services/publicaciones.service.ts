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

export type ResultadoEliminar = 'eliminada' | 'cancelada' | 'inexistente' | 'error';

@Service()
export class PublicacionesService {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);
  private url = `${environment.apiUrl}/publicaciones`;

  listar(opciones: {
    orden: OrdenPublicaciones;
    offset: number;
    limit: number;
    usuarioId?: string;
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

  obtenerPorId(id: string): Promise<Publicacion> {
    return firstValueFrom(this.http.get<Publicacion>(`${this.url}/${id}`));
  }

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
      return;
    }
    this.modalService.mostrarError(
      titulo,
      mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
    );
  }
}

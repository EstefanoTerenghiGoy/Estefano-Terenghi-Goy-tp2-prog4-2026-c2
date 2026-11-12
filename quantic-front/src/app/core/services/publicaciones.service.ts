import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EstadoMeGusta,
  OrdenPublicaciones,
  Publicacion,
  RespuestaPublicaciones,
} from '../../shared/models/publicacion';

@Service()
export class PublicacionesService {
  private http = inject(HttpClient);
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
}

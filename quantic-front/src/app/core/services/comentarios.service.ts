import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comentario, RespuestaComentarios } from '../../shared/models/comentario';

@Service()
export class ComentariosService {
  private http = inject(HttpClient);

  private url(publicacionId: string): string {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  // Los comentarios más recientes primero. El token lo agrega el interceptor
  listar(
    publicacionId: string,
    opciones: { offset: number; limit: number },
  ): Promise<RespuestaComentarios> {
    return firstValueFrom(
      this.http.get<RespuestaComentarios>(this.url(publicacionId), {
        params: { offset: opciones.offset, limit: opciones.limit },
      }),
    );
  }

  // Devuelve el comentario creado (el autor y la fecha los pone el back)
  crear(publicacionId: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(this.http.post<Comentario>(this.url(publicacionId), { mensaje }));
  }

  // Solo el autor puede editar (403 para otro usuario). Devuelve el comentario con modificado: true
  editar(publicacionId: string, comentarioId: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(
      this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje }),
    );
  }
}

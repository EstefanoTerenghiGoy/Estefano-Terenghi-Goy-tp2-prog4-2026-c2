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

  crear(publicacionId: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(this.http.post<Comentario>(this.url(publicacionId), { mensaje }));
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string): Promise<Comentario> {
    return firstValueFrom(
      this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje }),
    );
  }
}

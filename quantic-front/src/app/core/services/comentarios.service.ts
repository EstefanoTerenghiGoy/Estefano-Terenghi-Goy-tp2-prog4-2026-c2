import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaComentarios } from '../../shared/models/comentario';

@Service()
export class ComentariosService {
  private http = inject(HttpClient);

  // Los comentarios más recientes primero. El token lo agrega el interceptor
  listar(
    publicacionId: string,
    opciones: { offset: number; limit: number },
  ): Promise<RespuestaComentarios> {
    return firstValueFrom(
      this.http.get<RespuestaComentarios>(
        `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`,
        { params: { offset: opciones.offset, limit: opciones.limit } },
      ),
    );
  }
}

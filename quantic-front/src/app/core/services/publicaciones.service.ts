import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OrdenPublicaciones,
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
  }): Promise<RespuestaPublicaciones> {
    return firstValueFrom(
      this.http.get<RespuestaPublicaciones>(this.url, {
        params: {
          orden: opciones.orden,
          offset: opciones.offset,
          limit: opciones.limit,
        },
      }),
    );
  }
}

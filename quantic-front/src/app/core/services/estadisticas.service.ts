import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComentariosPorPublicacion,
  ComentariosTotal,
  PublicacionesPorUsuario,
} from '../../shared/models/estadisticas';

// Lapso en formato YYYY-MM-DD (el "hasta" incluye todo ese día)
export interface Lapso {
  desde: string;
  hasta: string;
}

@Service()
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(lapso: Lapso): Promise<PublicacionesPorUsuario[]> {
    return this.pedir<PublicacionesPorUsuario[]>('publicaciones-por-usuario', lapso);
  }

  comentariosTotal(lapso: Lapso): Promise<ComentariosTotal> {
    return this.pedir<ComentariosTotal>('comentarios-total', lapso);
  }

  comentariosPorPublicacion(lapso: Lapso): Promise<ComentariosPorPublicacion[]> {
    return this.pedir<ComentariosPorPublicacion[]>('comentarios-por-publicacion', lapso);
  }

  private pedir<T>(ruta: string, lapso: Lapso): Promise<T> {
    return firstValueFrom(
      this.http.get<T>(`${this.url}/${ruta}`, { params: { desde: lapso.desde, hasta: lapso.hasta } }),
    );
  }
}

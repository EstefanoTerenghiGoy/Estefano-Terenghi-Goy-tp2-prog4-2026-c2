import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  createdAt: string;
  modificado: boolean;
  autor: AutorPublicacion; // mismos datos públicos que el autor de una publicación
}

export interface RespuestaComentarios {
  datos: Comentario[];
  total: number; // cantidad total sin paginar
  offset: number;
  limit: number;
}

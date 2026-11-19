import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  createdAt: string;
  modificado: boolean;
  autor: AutorPublicacion;
}

export interface ComentarioNumerado {
  comentario: Comentario;
  numero: number;
}

export interface RespuestaComentarios {
  datos: Comentario[];
  total: number; 
  offset: number;
  limit: number;
}

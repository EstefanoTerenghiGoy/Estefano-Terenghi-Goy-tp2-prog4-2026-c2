export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string; 
  createdAt: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaMio: boolean;
  cantidadComentarios: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaMio: boolean;
}

export interface RespuestaPublicaciones {
  datos: Publicacion[];
  total: number; 
  offset: number;
  limit: number;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string; // opcional: puede no tener foto
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string; // opcional: la publicación puede no tener imagen
  createdAt: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaMio: boolean;
  cantidadComentarios: number;
}

// Respuesta de dar / quitar me gusta
export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaMio: boolean;
}

export interface RespuestaPublicaciones {
  datos: Publicacion[];
  total: number; // cantidad total sin paginar
  offset: number;
  limit: number;
}

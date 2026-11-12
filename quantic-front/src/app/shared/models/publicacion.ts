export type OrdenPublicaciones = 'fecha' | 'meGusta';

// Datos públicos del autor (el back nunca manda correo ni contraseña)
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

export interface RespuestaPublicaciones {
  datos: Publicacion[];
  total: number; // cantidad total sin paginar
  offset: number;
  limit: number;
}

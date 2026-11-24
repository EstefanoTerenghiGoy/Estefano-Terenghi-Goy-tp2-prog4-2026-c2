export interface PublicacionesPorUsuario {
  usuario: string; // nombreUsuario
  cantidad: number;
}

export interface ComentariosTotal {
  total: number;
  porDia: { fecha: string; cantidad: number }[]; // fecha YYYY-MM-DD, los días sin comentarios en 0
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

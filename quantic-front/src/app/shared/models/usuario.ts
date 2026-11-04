export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil?: string; // es opcional: puede no tener foto
  perfil: 'usuario' | 'administrador';
  activo: boolean;
}

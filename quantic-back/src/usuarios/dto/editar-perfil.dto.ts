import { PickType } from '@nestjs/mapped-types';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Solo estos datos se pueden cambiar, con las mismas validaciones que el registro.
// Correo, nombre de usuario, perfil y contraseña no se pueden editar.
export class EditarPerfilDto extends PickType(RegistroDto, [
  'nombre',
  'apellido',
  'descripcion',
  'fechaNacimiento',
] as const) {}

import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Alta de un usuario por un administrador: los mismos datos que el registro y además el perfil
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil debe ser "usuario" o "administrador"',
  })
  perfil: 'usuario' | 'administrador';
}

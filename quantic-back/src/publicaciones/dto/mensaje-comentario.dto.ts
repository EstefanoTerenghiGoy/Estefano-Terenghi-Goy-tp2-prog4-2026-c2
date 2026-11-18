import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Body para crear y editar un comentario
export class MensajeComentarioDto {
  // Se quitan los espacios del principio y del final antes de validar
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El mensaje debe ser texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(300, { message: 'El mensaje puede tener como máximo 300 caracteres' })
  mensaje: string;
}

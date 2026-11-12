import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título puede tener como máximo 100 caracteres' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, {
    message: 'La descripción puede tener como máximo 500 caracteres',
  })
  descripcion: string;
}

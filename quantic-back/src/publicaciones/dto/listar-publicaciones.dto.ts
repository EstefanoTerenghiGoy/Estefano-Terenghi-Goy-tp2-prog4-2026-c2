import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'El orden debe ser "fecha" o "meGusta"' })
  orden: 'fecha' | 'meGusta' = 'fecha';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit mínimo es 1' })
  @Max(50, { message: 'El limit máximo es 50' })
  limit: number = 10;

  @IsOptional()
  @IsMongoId({ message: 'El usuarioId no es válido' })
  usuarioId?: string;
}

import { IsDateString, IsOptional } from 'class-validator';

// Rango de fechas ISO de las estadísticas. Sin valores: los últimos 30 días
export class RangoFechasDto {
  @IsOptional()
  @IsDateString({}, { message: '"desde" no es una fecha ISO válida (por ejemplo 2026-11-01)' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: '"hasta" no es una fecha ISO válida (por ejemplo 2026-11-30)' })
  hasta?: string;
}

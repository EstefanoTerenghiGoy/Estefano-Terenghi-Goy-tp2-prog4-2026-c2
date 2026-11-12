import { IsMongoId } from 'class-validator';

// Valida el :id de la ruta (400 si no es un ObjectId válido)
export class IdPublicacionDto {
  @IsMongoId({ message: 'El id de la publicación no es válido' })
  id: string;
}

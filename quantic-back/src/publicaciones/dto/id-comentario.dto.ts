import { IsMongoId } from 'class-validator';

// Params de /publicaciones/:id/comentarios/:comentarioId
export class IdComentarioDto {
  @IsMongoId({ message: 'El id de la publicación no es válido' })
  id: string;

  @IsMongoId({ message: 'El id del comentario no es válido' })
  comentarioId: string;
}

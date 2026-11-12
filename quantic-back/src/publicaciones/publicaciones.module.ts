import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema.js';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module.js';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}

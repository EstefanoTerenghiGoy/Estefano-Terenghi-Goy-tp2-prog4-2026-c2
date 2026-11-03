import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema }
    ])
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [MongooseModule, UsuariosService], // Exportamos por si otro módulo (como publicaciones) necesita usarlo
})
export class UsuariosModule {}
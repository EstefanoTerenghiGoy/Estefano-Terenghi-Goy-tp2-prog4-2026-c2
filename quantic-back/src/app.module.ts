import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { StorageModule } from '@nestjs/storage';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    UsuariosModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

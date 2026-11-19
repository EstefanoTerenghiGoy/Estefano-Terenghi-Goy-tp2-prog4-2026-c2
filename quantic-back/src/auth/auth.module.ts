import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const DURACION_TOKEN = '1m';

@Module({
  imports: [
    UsuariosModule,
    CloudinaryModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'), // si falta, la app no arranca
        signOptions: { expiresIn: DURACION_TOKEN },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

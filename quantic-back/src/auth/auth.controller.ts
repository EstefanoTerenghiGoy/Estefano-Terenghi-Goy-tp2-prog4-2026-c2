import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, PayloadToken } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  registro(
    @Body() dto: RegistroDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.authService.registro(dto, archivo);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Valida el token y devuelve los datos actuales del usuario
  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  autorizar(@Req() req: { usuario: PayloadToken }) {
    return this.authService.autorizar(req.usuario.sub);
  }

  // Devuelve un token nuevo con vencimiento renovado
  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  refrescar(@Req() req: { usuario: PayloadToken }) {
    return this.authService.refrescar(req.usuario.sub);
  }
}

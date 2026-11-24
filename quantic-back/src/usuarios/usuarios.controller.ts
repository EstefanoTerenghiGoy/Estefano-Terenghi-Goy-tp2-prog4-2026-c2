import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';
import { IdUsuarioDto } from './dto/id-usuario.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard, PayloadToken } from '../auth/auth.guard.js';

const IMAGEN = () => FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024 } });

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Cualquier usuario logueado edita su propio perfil (el usuario sale siempre del token)
  @Put('perfil')
  @UseInterceptors(IMAGEN())
  editarPerfil(
    @Body() dto: EditarPerfilDto,
    @Req() req: { usuario: PayloadToken },
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.usuariosService.editarPerfil(req.usuario.sub, dto, archivo);
  }

  // --- Solo administradores ---

  @Get()
  @UseGuards(AdminGuard)
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(IMAGEN())
  async crear(@Body() dto: CrearUsuarioDto, @UploadedFile() archivo?: Express.Multer.File) {
    const usuario = await this.usuariosService.crear(dto, archivo, dto.perfil);
    const { password, ...sinPassword } = usuario.toObject();
    return sinPassword;
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deshabilitar(@Param() { id }: IdUsuarioDto, @Req() req: { usuario: PayloadToken }) {
    return this.usuariosService.deshabilitar(id, req.usuario.sub);
  }

  @Post(':id/habilitar')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  habilitar(@Param() { id }: IdUsuarioDto) {
    return this.usuariosService.habilitar(id);
  }
}

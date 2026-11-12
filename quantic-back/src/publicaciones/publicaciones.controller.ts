import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { IdPublicacionDto } from './dto/id-publicacion.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { AuthGuard, PayloadToken } from '../auth/auth.guard.js';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, archivo, cb) => {
        if (!archivo.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('El archivo debe ser una imagen'), false);
        }
        cb(null, true);
      },
    }),
  )
  crear(
    @Body() dto: CrearPublicacionDto,
    @Req() req: { usuario: PayloadToken },
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, req.usuario.sub, archivo);
  }

  @Get()
  listar(
    @Query() query: ListarPublicacionesDto,
    @Req() req: { usuario: PayloadToken },
  ) {
    return this.publicacionesService.listar(query, req.usuario.sub);
  }

  @Get(':id')
  obtener(@Param() { id }: IdPublicacionDto, @Req() req: { usuario: PayloadToken }) {
    return this.publicacionesService.obtener(id, req.usuario.sub);
  }

  @Delete(':id')
  eliminar(@Param() { id }: IdPublicacionDto, @Req() req: { usuario: PayloadToken }) {
    return this.publicacionesService.eliminar(id, req.usuario);
  }

  @Post(':id/me-gusta')
  @HttpCode(200)
  darMeGusta(@Param() { id }: IdPublicacionDto, @Req() req: { usuario: PayloadToken }) {
    return this.publicacionesService.darMeGusta(id, req.usuario.sub);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param() { id }: IdPublicacionDto, @Req() req: { usuario: PayloadToken }) {
    return this.publicacionesService.quitarMeGusta(id, req.usuario.sub);
  }

  @Get(':id/comentarios')
  listarComentarios(@Param() { id }: IdPublicacionDto, @Query() query: ListarComentariosDto) {
    return this.publicacionesService.listarComentarios(id, query);
  }
}

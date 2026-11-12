import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
}

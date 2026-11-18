import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { IdComentarioDto } from './dto/id-comentario.dto.js';
import { IdPublicacionDto } from './dto/id-publicacion.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { MensajeComentarioDto } from './dto/mensaje-comentario.dto.js';
import { AuthGuard, PayloadToken } from '../auth/auth.guard.js';

@Controller('publicaciones/:id/comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(@Param() { id }: IdPublicacionDto, @Query() query: ListarComentariosDto) {
    return this.comentariosService.listar(id, query);
  }

  @Post()
  crear(
    @Param() { id }: IdPublicacionDto,
    @Body() dto: MensajeComentarioDto,
    @Req() req: { usuario: PayloadToken },
  ) {
    return this.comentariosService.crear(id, dto, req.usuario.sub);
  }

  @Put(':comentarioId')
  editar(
    @Param() { id, comentarioId }: IdComentarioDto,
    @Body() dto: MensajeComentarioDto,
    @Req() req: { usuario: PayloadToken },
  ) {
    return this.comentariosService.editar(id, comentarioId, dto, req.usuario.sub);
  }
}

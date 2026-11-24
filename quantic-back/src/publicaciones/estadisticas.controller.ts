import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';

// Solo administradores. Todas reciben ?desde=&hasta= (fechas ISO; por defecto, los últimos 30 días)
@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() query: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(query);
  }

  @Get('comentarios-total')
  comentariosTotal(@Query() query: RangoFechasDto) {
    return this.estadisticasService.comentariosTotal(query);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(query);
  }
}

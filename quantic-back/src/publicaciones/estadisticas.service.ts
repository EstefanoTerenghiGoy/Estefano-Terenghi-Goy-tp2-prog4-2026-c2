import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

const DIA = 24 * 60 * 60 * 1000;

interface Rango {
  inicio: Date;
  fin: Date;
}

// Solo cuentan las publicaciones y los comentarios no eliminados. Las fechas se manejan en UTC.
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  async publicacionesPorUsuario(query: RangoFechasDto) {
    const { inicio, fin } = this.rango(query);
    return this.publicacionModel.aggregate([
      { $match: { eliminada: false, createdAt: { $gte: inicio, $lte: fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      { $project: { _id: 0, usuario: '$autor.nombreUsuario', cantidad: 1 } },
      { $sort: { cantidad: -1, usuario: 1 } },
    ]);
  }

  async comentariosTotal(query: RangoFechasDto) {
    const rango = this.rango(query);
    const porDiaBase: { fecha: string; cantidad: number }[] = await this.comentarioModel.aggregate([
      ...this.comentariosVigentes(rango),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
    ]);

    // Todos los días del rango, y 0 en los que no hubo comentarios
    const cantidades = new Map(porDiaBase.map((d) => [d.fecha, d.cantidad]));
    const porDia: { fecha: string; cantidad: number }[] = [];
    for (let t = this.inicioDelDia(rango.inicio); t <= rango.fin.getTime(); t += DIA) {
      const fecha = new Date(t).toISOString().slice(0, 10);
      porDia.push({ fecha, cantidad: cantidades.get(fecha) ?? 0 });
    }
    return { total: porDiaBase.reduce((suma, d) => suma + d.cantidad, 0), porDia };
  }

  // Las 10 publicaciones con más comentarios en el rango
  async comentariosPorPublicacion(query: RangoFechasDto) {
    return this.comentarioModel.aggregate([
      ...this.comentariosVigentes(this.rango(query)),
      {
        $group: {
          _id: '$publicacion',
          titulo: { $first: '$publicacion_.titulo' },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1, _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, publicacionId: '$_id', titulo: 1, cantidad: 1 } },
    ]);
  }

  // Comentarios del rango cuya publicación no está eliminada (el título queda en "publicacion_")
  private comentariosVigentes({ inicio, fin }: Rango): PipelineStage[] {
    return [
      { $match: { createdAt: { $gte: inicio, $lte: fin } } },
      {
        $lookup: {
          from: this.publicacionModel.collection.name,
          localField: 'publicacion',
          foreignField: '_id',
          pipeline: [{ $match: { eliminada: false } }, { $project: { titulo: 1 } }],
          as: 'publicacion_',
        },
      },
      { $unwind: '$publicacion_' },
    ];
  }

  // Por defecto, los últimos 30 días. "hasta" con solo la fecha incluye todo ese día.
  private rango({ desde, hasta }: RangoFechasDto): Rango {
    const fin = hasta
      ? /^\d{4}-\d{2}-\d{2}$/.test(hasta)
        ? new Date(`${hasta}T23:59:59.999Z`)
        : new Date(hasta)
      : new Date();
    const inicio = desde ? new Date(desde) : new Date(fin.getTime() - 30 * DIA);
    if (inicio.getTime() > fin.getTime()) {
      throw new BadRequestException('"desde" no puede ser posterior a "hasta"');
    }
    return { inicio, fin };
  }

  private inicioDelDia(fecha: Date): number {
    return Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  }
}

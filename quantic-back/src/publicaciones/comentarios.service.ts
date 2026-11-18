import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { MensajeComentarioDto } from './dto/mensaje-comentario.dto.js';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  async listar(publicacionId: string, { offset, limit }: ListarComentariosDto) {
    const id = new Types.ObjectId(publicacionId);
    await this.verificarPublicacion(id);

    const [datos, total] = await Promise.all([
      this.armarComentarios({ publicacion: id }, offset, limit),
      this.comentarioModel.countDocuments({ publicacion: id }),
    ]);
    return { datos, total, offset, limit };
  }

  async crear(publicacionId: string, dto: MensajeComentarioDto, autorId: string) {
    const id = new Types.ObjectId(publicacionId);
    await this.verificarPublicacion(id);

    const creado = await this.comentarioModel.create({
      publicacion: id,
      autor: new Types.ObjectId(autorId),
      mensaje: dto.mensaje,
    });
    return this.obtenerConFormato(creado._id);
  }

  async editar(
    publicacionId: string,
    comentarioId: string,
    dto: MensajeComentarioDto,
    usuarioId: string,
  ) {
    const id = new Types.ObjectId(publicacionId);
    await this.verificarPublicacion(id);

    const comentario = await this.comentarioModel.findOne({
      _id: new Types.ObjectId(comentarioId),
      publicacion: id,
    });
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }
    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede editar este comentario');
    }

    await this.comentarioModel.updateOne(
      { _id: comentario._id },
      { mensaje: dto.mensaje, modificado: true },
    );
    return this.obtenerConFormato(comentario._id);
  }

  private async verificarPublicacion(id: Types.ObjectId): Promise<void> {
    if (!(await this.publicacionModel.exists({ _id: id, eliminada: false }))) {
      throw new NotFoundException('La publicación no existe');
    }
  }

  private async obtenerConFormato(id: Types.ObjectId) {
    const [comentario] = await this.armarComentarios({ _id: id }, 0, 1);
    return comentario;
  }

  private armarComentarios(filtro: Record<string, unknown>, offset: number, limit: number) {
    const pipeline: PipelineStage[] = [
      { $match: filtro },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: this.usuarioModel.collection.name,
          localField: 'autor',
          foreignField: '_id',
          pipeline: [
            { $project: { nombre: 1, apellido: 1, nombreUsuario: 1, imagenPerfil: 1 } },
          ],
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      { $project: { mensaje: 1, createdAt: 1, modificado: 1, autor: 1 } },
    ];
    return this.comentarioModel.aggregate(pipeline);
  }
}

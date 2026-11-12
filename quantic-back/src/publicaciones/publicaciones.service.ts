import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async crear(dto: CrearPublicacionDto, autorId: string, archivo?: Express.Multer.File) {
    const imagen = archivo
      ? await this.cloudinaryService.subirArchivo(archivo, 'quantic/publicaciones')
      : undefined;

    const creada = await this.publicacionModel.create({
      autor: new Types.ObjectId(autorId),
      titulo: dto.titulo,
      mensaje: dto.descripcion, // en la base el campo se llama "mensaje"
      imagen,
    });

    const [publicacion] = await this.armarListado(
      { _id: creada._id },
      { createdAt: -1 },
      0,
      1,
      autorId,
    );
    return publicacion;
  }

  async listar(query: ListarPublicacionesDto, usuarioActualId: string) {
    const { orden, offset, limit, usuarioId } = query;

    const filtro: Record<string, unknown> = { eliminada: false };
    if (usuarioId) {
      filtro['autor'] = new Types.ObjectId(usuarioId);
    }

    // Con "meGusta" se desempata por fecha; _id asegura un orden estable al paginar
    const sort: Record<string, 1 | -1> =
      orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [datos, total] = await Promise.all([
      this.armarListado(filtro, sort, offset, limit, usuarioActualId),
      this.publicacionModel.countDocuments(filtro),
    ]);
    return { datos, total, offset, limit };
  }

  // Aggregate común a crear y listar: devuelve las publicaciones con el formato final
  private armarListado(
    filtro: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    offset: number,
    limit: number,
    usuarioActualId: string,
  ) {
    const pipeline: PipelineStage[] = [
      { $match: filtro },
      { $addFields: { cantidadMeGusta: { $size: '$meGusta' } } },
      { $sort: sort },
      { $skip: offset },
      { $limit: limit },
      {
        // Del autor solo se traen los campos públicos (nunca la contraseña)
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
      {
        $lookup: {
          from: this.comentarioModel.collection.name,
          localField: '_id',
          foreignField: 'publicacion',
          pipeline: [{ $project: { _id: 1 } }],
          as: 'comentarios',
        },
      },
      {
        $project: {
          titulo: 1,
          descripcion: '$mensaje',
          imagenUrl: '$imagen',
          createdAt: 1,
          autor: 1,
          cantidadMeGusta: 1,
          meGustaMio: { $in: [new Types.ObjectId(usuarioActualId), '$meGusta'] },
          cantidadComentarios: { $size: '$comentarios' },
        },
      },
    ];
    return this.publicacionModel.aggregate(pipeline);
  }
}

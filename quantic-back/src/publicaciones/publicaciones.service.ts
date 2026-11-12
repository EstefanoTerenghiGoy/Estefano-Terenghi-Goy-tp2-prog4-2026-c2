import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { Comentario } from './schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { PayloadToken } from '../auth/auth.guard.js';

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

  async obtener(id: string, usuarioActualId: string) {
    const [publicacion] = await this.armarListado(
      { _id: new Types.ObjectId(id), eliminada: false },
      { _id: 1 },
      0,
      1,
      usuarioActualId,
    );
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    return publicacion;
  }

  async eliminar(id: string, usuario: PayloadToken) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, eliminada: false });
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    const esAutor = publicacion.autor.toString() === usuario.sub;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }
    await this.publicacionModel.updateOne({ _id: id }, { eliminada: true });
    return { mensaje: 'Publicación eliminada correctamente' };
  }

  async darMeGusta(id: string, usuarioId: string) {
    const uid = new Types.ObjectId(usuarioId);
    const resultado = await this.publicacionModel.updateOne(
      { _id: id, eliminada: false, meGusta: { $ne: uid } },
      { $addToSet: { meGusta: uid } },
    );
    if (resultado.modifiedCount === 0) {
      await this.fallarMeGusta(id, 'Ya le diste me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, uid);
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const uid = new Types.ObjectId(usuarioId);
    const resultado = await this.publicacionModel.updateOne(
      { _id: id, eliminada: false, meGusta: uid },
      { $pull: { meGusta: uid } },
    );
    if (resultado.modifiedCount === 0) {
      await this.fallarMeGusta(id, 'Todavía no le diste me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, uid);
  }

  async listarComentarios(id: string, { offset, limit }: ListarComentariosDto) {
    const publicacionId = new Types.ObjectId(id);
    if (!(await this.publicacionModel.exists({ _id: publicacionId, eliminada: false }))) {
      throw new NotFoundException('La publicación no existe');
    }

    const [datos, total] = await Promise.all([
      this.comentarioModel.aggregate([
        { $match: { publicacion: publicacionId } },
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
      ]),
      this.comentarioModel.countDocuments({ publicacion: publicacionId }),
    ]);
    return { datos, total, offset, limit };
  }

  // El update no modificó nada: o la publicación no existe (404) o el me gusta ya estaba así (409)
  private async fallarMeGusta(id: string, mensajeConflicto: string): Promise<never> {
    if (!(await this.publicacionModel.exists({ _id: id, eliminada: false }))) {
      throw new NotFoundException('La publicación no existe');
    }
    throw new ConflictException(mensajeConflicto);
  }

  private async estadoMeGusta(id: string, uid: Types.ObjectId) {
    const publicacion = await this.publicacionModel.findById(id).select('meGusta').lean();
    const meGusta = publicacion?.meGusta ?? [];
    return {
      cantidadMeGusta: meGusta.length,
      meGustaMio: meGusta.some((x) => x.equals(uid)),
    };
  }

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

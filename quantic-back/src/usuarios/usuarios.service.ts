import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './schemas/usuario.schema.js';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // La contraseña no sale porque el schema la tiene con select: false
  listar() {
    return this.usuarioModel.find().sort({ createdAt: -1 }).lean();
  }

  // Lo usan el registro (perfil "usuario") y el alta de un administrador (perfil a elección)
  async crear(dto: RegistroDto, archivo: Express.Multer.File | undefined, perfil: string) {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    this.validarImagen(archivo);

    //Se chequean los duplicados antes de subir la imagen para no dejar archivos sueltos en cloudinary
    const correo = dto.correo.trim().toLowerCase();
    const nombreUsuario = dto.nombreUsuario.trim();
    if (await this.usuarioModel.exists({ correo })) {
      throw new ConflictException('El correo ya está registrado');
    }
    if (await this.usuarioModel.exists({ nombreUsuario })) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const imagenPerfil = archivo
      ? await this.cloudinaryService.subirArchivo(archivo, 'quantic/perfiles')
      : undefined;

    try {
      return await this.usuarioModel.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo,
        nombreUsuario,
        password: await bcrypt.hash(dto.password, 10),
        fechaNacimiento: new Date(dto.fechaNacimiento),
        descripcion: dto.descripcion,
        imagenPerfil,
        perfil,
      });
    } catch (error: any) {
      // 11000 = fallo en el unique index (dos registros simultáneos con los mismos datos)
      if (error?.code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están en uso');
      }
      throw error;
    }
  }

  // Baja lógica: el usuario queda deshabilitado pero no se borra
  async deshabilitar(id: string, solicitanteId: string) {
    if (id === solicitanteId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    return this.cambiarEstado(id, false);
  }

  habilitar(id: string) {
    return this.cambiarEstado(id, true);
  }

  // Siempre edita al usuario del token. Si viene una imagen, se sube y reemplaza a la anterior
  async editarPerfil(usuarioId: string, dto: EditarPerfilDto, archivo?: Express.Multer.File) {
    this.validarImagen(archivo);
    const imagenPerfil = archivo
      ? await this.cloudinaryService.subirArchivo(archivo, 'quantic/perfiles')
      : undefined;

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        usuarioId,
        {
          nombre: dto.nombre,
          apellido: dto.apellido,
          descripcion: dto.descripcion,
          fechaNacimiento: new Date(dto.fechaNacimiento),
          ...(imagenPerfil && { imagenPerfil }),
        },
        { new: true },
      )
      .lean();
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  private async cambiarEstado(id: string, activo: boolean) {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { activo }, { new: true })
      .lean();
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  private validarImagen(archivo?: Express.Multer.File): void {
    if (archivo && !archivo.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }
  }
}

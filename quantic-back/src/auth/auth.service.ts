import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registro(dto: RegistroDto, archivo?: Express.Multer.File) {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    if (archivo && !archivo.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

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
      const usuario = await this.usuarioModel.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo,
        nombreUsuario,
        password: await bcrypt.hash(dto.password, 10),
        fechaNacimiento: new Date(dto.fechaNacimiento),
        descripcion: dto.descripcion,
        imagenPerfil,
        perfil: 'usuario', // siempre "usuario", sin importar lo que mande el cliente por seguridad
      });
      return { usuario: this.sinPassword(usuario) };
    } catch (error: any) {
      // 11000 = fallo en el unique index (dos registros simultáneos con los mismos datos)
      if (error?.code === 11000) {
        throw new ConflictException(
          'El correo o el nombre de usuario ya están en uso',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identificador = dto.usuario.trim();
    const usuario = await this.usuarioModel
      .findOne({
        $or: [
          { nombreUsuario: identificador },
          { correo: identificador.toLowerCase() },
        ],
      })
      .select('+password');

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return { usuario: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: { toObject(): Record<string, any> }) {
    const { password, ...resto } = usuario.toObject();
    return resto;
  }
}

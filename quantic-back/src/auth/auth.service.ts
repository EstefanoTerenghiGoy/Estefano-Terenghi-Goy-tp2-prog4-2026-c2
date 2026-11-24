import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  // El alta del usuario (validaciones, imagen, duplicados) la hace UsuariosService, que también la
  // usa el administrador para crear usuarios. Acá el perfil es siempre "usuario", sin importar
  // lo que mande el cliente.
  async registro(dto: RegistroDto, archivo?: Express.Multer.File) {
    const usuario = await this.usuariosService.crear(dto, archivo, 'usuario');
    return this.respuestaConToken(usuario);
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
    if (!usuario.activo) {
      throw new ForbiddenException(
        'Tu cuenta está deshabilitada. Contactá a un administrador.',
      );
    }
    return this.respuestaConToken(usuario);
  }

  async autorizar(usuarioId: string) {
    const usuario = await this.buscarUsuarioActivo(usuarioId);
    return this.sinPassword(usuario);
  }

  async refrescar(usuarioId: string) {
    const usuario = await this.buscarUsuarioActivo(usuarioId);
    return { token: await this.firmarToken(usuario) };
  }

  private async buscarUsuarioActivo(usuarioId: string) {
    const usuario = Types.ObjectId.isValid(usuarioId)
      ? await this.usuarioModel.findById(usuarioId)
      : null;
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return usuario;
  }

  private firmarToken(usuario: HydratedDocument<Usuario>) {
    return this.jwtService.signAsync({
      sub: usuario.id,
      usuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    });
  }

  private async respuestaConToken(
    usuario: HydratedDocument<Usuario>,
  ) {
    const token = await this.firmarToken(usuario);
    return { token, usuario: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: { toObject(): Record<string, any> }) {
    const { password, ...resto } = usuario.toObject();
    return resto;
  }
}

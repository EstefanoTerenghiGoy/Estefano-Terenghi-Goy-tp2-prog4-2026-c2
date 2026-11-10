import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface PayloadToken {
  sub: string;
  usuario: string;
  perfil: 'usuario' | 'administrador';
}

// Exige "Authorization: Bearer <token>" válido y deja el payload en request['usuario']
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }
    try {
      request['usuario'] = await this.jwtService.verifyAsync<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('El token es inválido o venció');
    }
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

// Va después de AuthGuard: solo deja pasar si el token es de un administrador
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request['usuario']?.perfil !== 'administrador') {
      throw new ForbiddenException('No tenés permiso para realizar esta acción');
    }
    return true;
  }
}

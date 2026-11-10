import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario';

const CLAVE_TOKEN = 'quantic_token';
const CLAVE_USUARIO = 'quantic_usuario';

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  registro(formData: FormData): Promise<RespuestaAuth> {
    return firstValueFrom(this.http.post<RespuestaAuth>(`${this.url}/registro`, formData));
  }

  login(usuario: string, password: string): Promise<RespuestaAuth> {
    return firstValueFrom(this.http.post<RespuestaAuth>(`${this.url}/login`, { usuario, password }));
  }

  guardarSesion(token: string, usuario: Usuario): void {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {}
  }

  obtenerToken(): string | null {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  obtenerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }

  estaLogueado(): boolean {
    return this.obtenerToken() !== null;
  }

  cerrarSesion(): void {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {}
  }
}

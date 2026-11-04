import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario';

const CLAVE_USUARIO = 'quantic_usuario';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  registro(formData: FormData): Promise<{ usuario: Usuario }> {
    return firstValueFrom(this.http.post<{ usuario: Usuario }>(`${this.url}/registro`, formData));
  }

  login(usuario: string, password: string): Promise<{ usuario: Usuario }> {
    return firstValueFrom(
      this.http.post<{ usuario: Usuario }>(`${this.url}/login`, { usuario, password }),
    );
  }

  guardarUsuario(usuario: Usuario): void {
    try {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {}
  }

  obtenerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }

  cerrarSesion(): void {
    try {
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {}
  }
}

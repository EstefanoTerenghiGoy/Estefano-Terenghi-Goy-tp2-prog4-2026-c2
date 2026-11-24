import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario';

const CLAVE_TOKEN = 'quantic_token';
const CLAVE_USUARIO = 'quantic_usuario';

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

function leerUsuarioGuardado(): Usuario | null {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  // Usuario logueado como signal: el navbar y el perfil se actualizan solos cuando cambia
  private usuarioActual = signal<Usuario | null>(leerUsuarioGuardado());
  usuario = this.usuarioActual.asReadonly();
  esAdmin = computed(() => this.usuarioActual()?.perfil === 'administrador');

  registro(formData: FormData): Promise<RespuestaAuth> {
    return firstValueFrom(this.http.post<RespuestaAuth>(`${this.url}/registro`, formData));
  }

  login(usuario: string, password: string): Promise<RespuestaAuth> {
    return firstValueFrom(this.http.post<RespuestaAuth>(`${this.url}/login`, { usuario, password }));
  }

  async autorizar(): Promise<Usuario> {
    const usuario = await firstValueFrom(this.http.post<Usuario>(`${this.url}/autorizar`, {}));
    this.actualizarUsuario(usuario); // datos frescos
    return usuario;
  }

  async refrescar(): Promise<void> {
    const { token } = await firstValueFrom(
      this.http.post<{ token: string }>(`${this.url}/refrescar`, {}),
    );
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {}
  }

  guardarSesion(token: string, usuario: Usuario): void {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {}
    this.actualizarUsuario(usuario);
  }

  // Guarda el usuario (por ejemplo, después de editar el perfil) y avisa a quien lo esté mostrando
  actualizarUsuario(usuario: Usuario): void {
    try {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {}
    this.usuarioActual.set(usuario);
  }

  obtenerToken(): string | null {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioActual();
  }

  estaLogueado(): boolean {
    return this.obtenerToken() !== null;
  }

  cerrarSesion(): void {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {}
    this.usuarioActual.set(null);
  }
}

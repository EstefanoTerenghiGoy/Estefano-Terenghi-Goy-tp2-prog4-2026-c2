import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario';

@Service()
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  // --- Solo administradores ---

  listar(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>(this.url));
  }

  // FormData con los datos del registro, "perfil" y (opcional) el archivo en "imagen"
  crear(formData: FormData): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(this.url, formData));
  }

  // Baja y alta lógicas: devuelven el usuario con su estado nuevo
  deshabilitar(id: string): Promise<Usuario> {
    return firstValueFrom(this.http.delete<Usuario>(`${this.url}/${id}`));
  }

  habilitar(id: string): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {}));
  }

  // --- Cualquier usuario logueado ---

  // FormData con nombre, apellido, descripcion, fechaNacimiento y (opcional) "imagen"
  editarPerfil(formData: FormData): Promise<Usuario> {
    return firstValueFrom(this.http.put<Usuario>(`${this.url}/perfil`, formData));
  }
}

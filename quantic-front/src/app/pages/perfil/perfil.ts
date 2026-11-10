import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FechaLarga } from '../../shared/pipes/fecha-larga';
import { Iniciales } from '../../shared/pipes/iniciales';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, Iniciales, FechaLarga],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private authService = inject(AuthService);

  usuario = signal(this.authService.obtenerUsuario());

  nombreCompleto = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre} ${u.apellido}` : '';
  });

  insignia = computed(() => (this.usuario()?.perfil === 'administrador' ? 'ADMIN' : 'USUARIO'));
}

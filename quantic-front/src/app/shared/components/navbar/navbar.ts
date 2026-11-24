import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoopService } from '../../../core/services/loop.service';
import { ClickOutside } from '../../directives/click-outside';
import { Iniciales } from '../../pipes/iniciales';
import { ReglaLoop } from '../regla-loop/regla-loop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ClickOutside, Iniciales, ReglaLoop],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  loop = inject(LoopService);

  // Signal del AuthService: si el usuario edita su perfil, la burbuja se actualiza sola
  usuario = this.authService.usuario;
  esAdmin = this.authService.esAdmin;
  menuAbierto = signal(false);

  // Para las iniciales de la burbuja cuando el usuario no tiene imagen
  nombreCompleto = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre} ${u.apellido}` : '';
  });

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  alApretarEsc(): void {
    this.cerrarMenu();
  }

  async cerrarSesion(): Promise<void> {
    this.loop.detener();
    this.authService.cerrarSesion();
    this.cerrarMenu();
    await this.router.navigate(['/login']);
  }
}

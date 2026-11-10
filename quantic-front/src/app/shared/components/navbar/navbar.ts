import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClickOutside } from '../../directives/click-outside';
import { Iniciales } from '../../pipes/iniciales';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ClickOutside, Iniciales],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal(this.authService.obtenerUsuario());
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
    this.authService.cerrarSesion();
    this.cerrarMenu();
    await this.router.navigate(['/login']);
  }
}

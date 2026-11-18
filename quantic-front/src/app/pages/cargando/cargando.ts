import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const ESPERA_LENTA_MS = 5000;

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  validando = signal(true);
  lento = signal(false);

  texto = computed(() =>
    this.lento()
      ? 'Despertando el servidor, puede tardar hasta un minuto…'
      : 'SINCRONIZANDO CON LA NAVE…',
  );

  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private destruido = false;

  ngOnInit(): void {
    this.validar();
  }

  async validar(): Promise<void> {
    if (!this.authService.obtenerToken()) {
      await this.router.navigate(['/login']);
      return;
    }

    this.validando.set(true);
    this.lento.set(false);
    this.temporizador = setTimeout(() => this.lento.set(true), ESPERA_LENTA_MS);

    try {
      await this.authService.autorizar();
      if (!this.destruido) {
        await this.router.navigate(['/publicaciones']);
      }
    } catch (error) {
      this.limpiarTemporizador();
      if (this.destruido) {
        return;
      }
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.authService.cerrarSesion();
        await this.router.navigate(['/login']);
      } else {
        this.validando.set(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.limpiarTemporizador();
  }

  private limpiarTemporizador(): void {
    clearTimeout(this.temporizador);
  }
}

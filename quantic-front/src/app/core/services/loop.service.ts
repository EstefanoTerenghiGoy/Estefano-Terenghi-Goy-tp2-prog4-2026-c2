import { Router } from '@angular/router';
import { Service, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { esSesionVencida, mensajeDeError } from '../utils/mensaje-error';
import { decodificarToken } from '../utils/token';

export const MINUTOS_AVISO = 5;

@Service()
export class LoopService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  segundosRestantes = signal(0);
  duracionTotal = signal(0); // exp - iat del token
  avisoVisible = signal(false);
  extendiendo = signal(false);

  // Porcentaje de loop que queda, de 0 a 100
  porcentaje = computed(() => {
    const total = this.duracionTotal();
    return total > 0 ? Math.min(100, Math.max(0, (this.segundosRestantes() / total) * 100)) : 0;
  });

  // "MM:SS"
  tiempoTexto = computed(() => {
    const segundos = this.segundosRestantes();
    const minutos = Math.floor(segundos / 60);
    return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
  });

  private intervalo: ReturnType<typeof setInterval> | undefined;
  private tokenAvisado: string | null = null;

  iniciar(): void {
    this.detener(); 
    if (this.actualizar()) {
      this.intervalo = setInterval(() => this.actualizar(), 1000);
    }
  }

  detener(): void {
    clearInterval(this.intervalo);
    this.intervalo = undefined;
  }

  cerrarAviso(): void {
    this.avisoVisible.set(false);
  }

  async extender(): Promise<void> {
    if (this.extendiendo()) {
      return;
    }
    this.extendiendo.set(true);
    try {
      await this.authService.refrescar();
      this.avisoVisible.set(false);
      this.iniciar();
    } catch (error) {
      this.avisoVisible.set(false); 
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudo extender el loop',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.extendiendo.set(false);
    }
  }

  private actualizar(): boolean {
    const token = this.authService.obtenerToken();
    const tiempo = decodificarToken(token);
    if (!token || !tiempo) {
      this.vencer();
      return false;
    }

    const restantes = Math.max(0, Math.ceil(tiempo.exp - Date.now() / 1000));
    this.duracionTotal.set(tiempo.exp - tiempo.iat);
    this.segundosRestantes.set(restantes);

    if (restantes <= 0) {
      this.vencer();
      return false;
    }
    if (restantes <= MINUTOS_AVISO * 60 && this.tokenAvisado !== token) {
      this.tokenAvisado = token;
      this.avisoVisible.set(true);
    }
    return true;
  }

  private async vencer(): Promise<void> {
    this.detener();
    this.avisoVisible.set(false);
    this.authService.cerrarSesion();
    await this.router.navigate(['/login']);
    this.modalService.mostrarError('Sesión vencida', 'Tu sesión expiró. Volvé a iniciar sesión.');
  }
}

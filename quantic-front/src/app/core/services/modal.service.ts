import { Service, signal } from '@angular/core';

@Service()
export class ModalService {
  visible = signal(false);
  titulo = signal('');
  mensaje = signal('');

  mostrarError(titulo: string, mensaje: string): void {
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
  }
}

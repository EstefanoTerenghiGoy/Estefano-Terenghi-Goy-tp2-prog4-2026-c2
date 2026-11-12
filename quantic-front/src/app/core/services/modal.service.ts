import { Service, signal } from '@angular/core';

@Service()
export class ModalService {
  visible = signal(false);
  tipo = signal<'error' | 'confirmacion'>('error');
  titulo = signal('');
  mensaje = signal('');

  // Resuelve la promesa de confirmar() mientras la confirmación está abierta
  private resolverConfirmacion: ((acepto: boolean) => void) | null = null;

  mostrarError(titulo: string, mensaje: string): void {
    this.resolver(false); // por si había una confirmación abierta
    this.tipo.set('error');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.visible.set(true);
  }

  // Devuelve true si el usuario aprieta "Eliminar" y false si cancela (botón o Esc)
  confirmar(titulo: string, mensaje: string): Promise<boolean> {
    this.resolver(false);
    this.tipo.set('confirmacion');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.visible.set(true);
    return new Promise((resolver) => (this.resolverConfirmacion = resolver));
  }

  aceptar(): void {
    this.resolver(true);
  }

  cerrar(): void {
    this.resolver(false);
  }

  private resolver(acepto: boolean): void {
    this.resolverConfirmacion?.(acepto);
    this.resolverConfirmacion = null;
    this.visible.set(false);
  }
}

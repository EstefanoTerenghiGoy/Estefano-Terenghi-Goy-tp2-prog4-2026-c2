import { Service, signal } from '@angular/core';

@Service()
export class ModalService {
  visible = signal(false);
  tipo = signal<'error' | 'confirmacion'>('error');
  titulo = signal('');
  mensaje = signal('');
  // Botón principal de la confirmación: texto y si es rojo (acción destructiva)
  textoConfirmar = signal('Eliminar');
  peligro = signal(true);

  private resolverConfirmacion: ((acepto: boolean) => void) | null = null;

  mostrarError(titulo: string, mensaje: string): void {
    this.resolver(false);
    this.tipo.set('error');
    this.titulo.set(titulo);
    this.mensaje.set(mensaje);
    this.visible.set(true);
  }

  confirmar(
    titulo: string,
    mensaje: string,
    opciones: { texto?: string; peligro?: boolean } = {},
  ): Promise<boolean> {
    this.resolver(false);
    this.tipo.set('confirmacion');
    this.textoConfirmar.set(opciones.texto ?? 'Eliminar');
    this.peligro.set(opciones.peligro ?? true);
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

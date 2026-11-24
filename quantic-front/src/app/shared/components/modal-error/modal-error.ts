import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-modal-error',
  templateUrl: './modal-error.html',
  styleUrl: './modal-error.css',
})
export class ModalError implements AfterViewInit {
  titulo = input.required<string>();
  mensaje = input.required<string>();
  // "error": un solo botón "Entendido". "confirmacion": botones "Cancelar" y "Eliminar".
  // "aviso": reloj naranja y botones "Extender el loop" (emite confirmar) y "Ahora no" (emite cerrar)
  tipo = input<'error' | 'confirmacion' | 'aviso'>('error');
  textoConfirmar = input('Eliminar'); // texto del botón principal de la confirmación
  peligro = input(true); // rojo si la acción es destructiva
  ocupado = input(false); // deshabilita el botón principal mientras hay un pedido en curso
  cerrar = output<void>();
  confirmar = output<void>();

  private botonCerrar = viewChild.required<ElementRef<HTMLButtonElement>>('botonCerrar');

  ngAfterViewInit(): void {
    this.botonCerrar().nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  alApretarEsc(): void {
    this.cerrar.emit();
  }
}

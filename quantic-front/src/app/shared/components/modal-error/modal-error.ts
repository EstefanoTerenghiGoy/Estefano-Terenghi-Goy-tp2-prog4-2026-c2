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
  cerrar = output<void>();

  private botonCerrar = viewChild.required<ElementRef<HTMLButtonElement>>('botonCerrar');

  ngAfterViewInit(): void {
    this.botonCerrar().nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  alApretarEsc(): void {
    this.cerrar.emit();
  }
}

import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

// Emite "clickOutside" cuando se hace click fuera del elemento donde está puesta
@Directive({ selector: '[clickOutside]' })
export class ClickOutside {
  clickOutside = output<void>();

  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('document:click', ['$event.target'])
  alHacerClick(destino: EventTarget | null): void {
    if (!this.elemento.nativeElement.contains(destino as Node)) {
      this.clickOutside.emit();
    }
  }
}

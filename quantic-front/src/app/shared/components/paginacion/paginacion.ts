import { Component, computed, input, output } from '@angular/core';

const MAX_NUMEROS = 5; // cuántos números de página se muestran a la vez

@Component({
  selector: 'app-paginacion',
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class Paginacion {
  pagina = input.required<number>();
  totalPaginas = input.required<number>();
  cambiar = output<number>();

  // Ventana de números centrada en la página actual, para que no se desborde con muchas páginas
  numeros = computed(() => {
    const total = this.totalPaginas();
    const cantidad = Math.min(MAX_NUMEROS, total);
    const inicio = Math.min(
      Math.max(1, this.pagina() - Math.floor(cantidad / 2)),
      total - cantidad + 1,
    );
    return Array.from({ length: cantidad }, (_, i) => inicio + i);
  });

  elegir(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.pagina()) {
      this.cambiar.emit(pagina);
    }
  }
}

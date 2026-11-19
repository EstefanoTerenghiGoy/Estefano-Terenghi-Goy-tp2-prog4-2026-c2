import { Component, computed, input } from '@angular/core';
import { espiral, hashTexto } from '../../utils/nomai';

// Espiral chica de cada comentario: violeta si está en glifos, y beige dibujándose al traducirse.
// La forma sale del hash del _id, así que es siempre la misma para el mismo comentario.
@Component({
  selector: 'app-mini-espiral',
  template: `
    <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
      <path class="violeta" [attr.d]="camino()" pathLength="1" />
      @if (traducido()) {
        <path class="beige nomai-draw" [attr.d]="camino()" pathLength="1" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    path {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .violeta {
      stroke: var(--violeta);
      stroke-width: 1.6;
    }

    .beige {
      stroke: var(--beige);
      stroke-width: 1.8;
    }
  `,
})
export class MiniEspiral {
  idComentario = input.required<string>();
  traducido = input(false);

  camino = computed(() => {
    const k = hashTexto(this.idComentario()) % 97;
    return espiral(
      { cx: 22, cy: 22, r: 18, start: Math.PI + k * 1.3, dir: k % 2 ? 1 : -1, seed: k },
      11,
    );
  });
}

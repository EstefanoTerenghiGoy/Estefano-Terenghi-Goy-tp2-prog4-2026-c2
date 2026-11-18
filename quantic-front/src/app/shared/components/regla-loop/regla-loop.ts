import { Component, computed, inject } from '@angular/core';
import { LoopService } from '../../../core/services/loop.service';

@Component({
  selector: 'app-regla-loop',
  templateUrl: './regla-loop.html',
  styleUrl: './regla-loop.css',
})
export class ReglaLoop {
  loop = inject(LoopService);

  etiqueta = computed(() => {
    const minutos = Math.ceil(this.loop.segundosRestantes() / 60);
    return minutos <= 1
      ? 'Tiempo restante del loop: menos de un minuto'
      : `Tiempo restante del loop: ${minutos} minutos`;
  });
}

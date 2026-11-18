import { Component, computed, inject } from '@angular/core';
import { LoopService } from '../../../core/services/loop.service';

const CENTRO = 75;
const RADIO = 62;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

@Component({
  selector: 'app-estado-loop',
  templateUrl: './estado-loop.html',
  styleUrl: './estado-loop.css',
})
export class EstadoLoop {
  loop = inject(LoopService);

  centro = CENTRO;
  radio = RADIO;
  circunferencia = CIRCUNFERENCIA;

  desplazamiento = computed(() => CIRCUNFERENCIA * (1 - this.loop.porcentaje() / 100));

  punto = computed(() => {
    const angulo = (this.loop.porcentaje() / 100) * 2 * Math.PI - Math.PI / 2;
    return { x: CENTRO + RADIO * Math.cos(angulo), y: CENTRO + RADIO * Math.sin(angulo) };
  });

  etiqueta = computed(() => {
    const minutos = Math.ceil(this.loop.segundosRestantes() / 60);
    return minutos <= 1
      ? 'Tiempo restante del loop: menos de un minuto'
      : `Tiempo restante del loop: ${minutos} minutos`;
  });
}

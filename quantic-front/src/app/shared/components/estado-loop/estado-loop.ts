import { Component, computed, inject } from '@angular/core';
import { LoopService } from '../../../core/services/loop.service';

// Medidas del anillo (el SVG es de 150 x 150)
const CENTRO = 75;
const RADIO = 62;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

// Franja "ESTADO DEL LOOP": sin lógica propia, solo muestra las señales del LoopService
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

  // El arco naranja es el porcentaje que queda: se "esconde" el resto del círculo con el desplazamiento
  desplazamiento = computed(() => CIRCUNFERENCIA * (1 - this.loop.porcentaje() / 100));

  // Punto claro al final del arco; el arco arranca arriba (-90°) y avanza en sentido horario
  punto = computed(() => {
    const angulo = (this.loop.porcentaje() / 100) * 2 * Math.PI - Math.PI / 2;
    return { x: CENTRO + RADIO * Math.cos(angulo), y: CENTRO + RADIO * Math.sin(angulo) };
  });

  // Duración total del token en minutos (sale del token, no está escrita a mano)
  minutosPorLoop = computed(() => Math.round(this.loop.duracionTotal() / 60));

  textoDuracion = computed(() => {
    const minutos = this.minutosPorLoop();
    return `CADA LOOP DURA ${minutos} ${minutos === 1 ? 'MINUTO' : 'MINUTOS'}`;
  });

  // Para lectores de pantalla: en minutos, así cambia una vez por minuto y no cada segundo
  etiqueta = computed(() => {
    const minutos = Math.ceil(this.loop.segundosRestantes() / 60);
    return minutos <= 1
      ? 'Tiempo restante del loop: menos de un minuto'
      : `Tiempo restante del loop: ${minutos} minutos`;
  });
}

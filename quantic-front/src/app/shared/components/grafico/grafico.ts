import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  computed,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
} from 'chart.js';

// Solo se registra lo que usan los tres tipos de gráfico (así pesa menos)
Chart.register(
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  Filler,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

// Paleta de Quantic: naranja, violeta, beige, cian y algunos tonos más para tortas con muchos datos
const PALETA = ['#f28c38', '#8b6cf0', '#eadbb8', '#5cc8e0', '#34c79a', '#e5484d', '#ffb27a', '#a996f5'];
const TEXTO = '#e8e6df';
const TEXTO_SUAVE = '#9aa0b4';
const GRILLA = '#1e2436';

// Gráfico de Chart.js con los colores de Quantic. Recibe todo por input() y se vuelve a dibujar si
// cambian los datos.
@Component({
  selector: 'app-grafico',
  template: `
    <figure class="grafico">
      <figcaption class="titulo">{{ titulo() }}</figcaption>
      <div class="lienzo">
        <canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>
      </div>
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }

    .grafico {
      margin: 0;
    }

    .titulo {
      margin-bottom: 14px;
      font-family: var(--fuente-mono);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--violeta-claro);
    }

    .lienzo {
      position: relative;
      height: 280px;
    }
  `,
})
export class Grafico implements AfterViewInit, OnChanges, OnDestroy {
  tipo = input.required<'pie' | 'line' | 'bar'>();
  etiquetas = input.required<string[]>();
  datos = input.required<number[]>();
  titulo = input.required<string>();

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico: Chart | null = null;

  // Texto para lectores de pantalla (el canvas no se puede leer)
  descripcion = computed(
    () =>
      `${this.titulo()}: ` +
      this.etiquetas()
        .map((etiqueta, i) => `${etiqueta} ${this.datos()[i]}`)
        .join(', '),
  );

  ngAfterViewInit(): void {
    this.dibujar();
  }

  ngOnChanges(): void {
    if (this.grafico) {
      this.dibujar(); // cambiaron los datos: se vuelve a dibujar
    }
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }

  private dibujar(): void {
    this.grafico?.destroy();
    const tipo = this.tipo();
    const esTorta = tipo === 'pie';
    this.grafico = new Chart(this.lienzo().nativeElement, {
      type: tipo,
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            data: this.datos(),
            backgroundColor: esTorta
              ? this.etiquetas().map((_, i) => PALETA[i % PALETA.length])
              : tipo === 'line'
                ? 'rgba(139, 108, 240, 0.18)'
                : '#f28c38',
            borderColor: esTorta ? '#0c0f18' : tipo === 'line' ? '#8b6cf0' : '#f28c38',
            borderWidth: esTorta ? 2 : tipo === 'line' ? 2 : 0,
            borderRadius: tipo === 'bar' ? 6 : 0,
            fill: tipo === 'line',
            tension: 0.3,
            pointBackgroundColor: '#eadbb8',
            pointRadius: tipo === 'line' ? 3 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: TEXTO,
        plugins: {
          legend: { display: esTorta, position: 'bottom', labels: { color: TEXTO, boxWidth: 12 } },
          tooltip: { backgroundColor: '#0c0f18', borderColor: GRILLA, borderWidth: 1 },
        },
        scales: esTorta
          ? {}
          : {
              x: { ticks: { color: TEXTO_SUAVE }, grid: { color: GRILLA } },
              y: {
                beginAtZero: true,
                ticks: { color: TEXTO_SUAVE, precision: 0 }, // solo números enteros
                grid: { color: GRILLA },
              },
            },
      },
    });
  }
}

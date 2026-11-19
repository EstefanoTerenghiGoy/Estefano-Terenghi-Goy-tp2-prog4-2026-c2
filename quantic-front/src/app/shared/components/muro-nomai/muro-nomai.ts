import { Component, computed, input, output } from '@angular/core';
import { ComentarioNumerado } from '../../models/comentario';
import { EspiralDef, espiral, inicioDe, rama } from '../../utils/nomai';

const POR_TESELA = 5; // comentarios (espirales) que entran en cada tesela
const GROSORES = [1.7, 1.6, 1.5, 1.4, 1.4];

interface EspiralMuro {
  id: string; // _id del comentario
  numero: number;
  camino: string;
  grosor: number;
  x: number; // inicio de la espiral
  y: number;
}

interface Tesela {
  indice: number;
  espirales: EspiralMuro[];
}

// Panel con una espiral por comentario, como la escritura de los Nomai. Solo muestra: el estado de
// traducción vive en la pantalla de detalle, y tocar una espiral avisa con "traducir".
@Component({
  selector: 'app-muro-nomai',
  templateUrl: './muro-nomai.html',
  styleUrl: './muro-nomai.css',
})
export class MuroNomai {
  items = input.required<ComentarioNumerado[]>(); // los comentarios cargados, del más nuevo al más viejo
  total = input.required<number>();
  traducidos = input.required<ReadonlySet<string>>();
  seleccionado = input<string | null>(null);
  traducir = output<string>(); // _id del comentario

  traducidas = computed(() => this.traducidos().size);
  porcentaje = computed(() => (this.total() > 0 ? (this.traducidas() / this.total()) * 100 : 0));

  // Una tesela por cada 5 comentarios cargados, apiladas. Los trazos solo se recalculan si cambian
  // los comentarios, no al traducir.
  teselas = computed<Tesela[]>(() => {
    const items = this.items();
    const resultado: Tesela[] = [];
    for (let t = 0; t * POR_TESELA < items.length; t++) {
      // Las semillas cambian con el índice de la tesela para que no se repitan
      const raiz: EspiralDef = { cx: 195, cy: 170, r: 100, start: Math.PI, dir: 1, seed: 3 + t * 11 };
      const defs = [
        raiz,
        rama(raiz, 1.0, 50, -1, 5 + t * 13),
        rama(raiz, 2.2, 42, 1, 7 + t * 17),
        rama(raiz, 3.4, 36, -1, 9 + t * 19),
        rama(raiz, 4.6, 30, 1, 11 + t * 23),
      ];
      const espirales = items.slice(t * POR_TESELA, (t + 1) * POR_TESELA).map((item, j) => {
        const camino = espiral(defs[j], 12.6);
        const { x, y } = inicioDe(camino);
        return { id: item.comentario._id, numero: item.numero, camino, grosor: GROSORES[j], x, y };
      });
      resultado.push({ indice: t, espirales });
    }
    return resultado;
  });

  estaTraducido(id: string): boolean {
    return this.traducidos().has(id);
  }

  // Enter y Espacio activan la espiral (el Espacio no debe hacer scroll)
  activar(evento: Event, id: string): void {
    evento.preventDefault();
    this.traducir.emit(id);
  }
}

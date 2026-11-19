import { Component, computed, input } from '@angular/core';
import { Comentario as ComentarioModelo } from '../../models/comentario';
import { Iniciales } from '../../pipes/iniciales';
import { TiempoRelativo } from '../../pipes/tiempo-relativo';

// Una transmisión (comentario). Por ahora el mensaje va como texto normal; en el paso 7 se le suma
// la capa de glifos sobre el mismo bloque del mensaje, sin tocar el resto.
@Component({
  selector: 'app-comentario',
  imports: [Iniciales, TiempoRelativo],
  templateUrl: './comentario.html',
  styleUrl: './comentario.css',
})
export class Comentario {
  comentario = input.required<ComentarioModelo>();

  nombreAutor = computed(() => {
    const autor = this.comentario().autor;
    return `${autor.nombre} ${autor.apellido}`;
  });
}

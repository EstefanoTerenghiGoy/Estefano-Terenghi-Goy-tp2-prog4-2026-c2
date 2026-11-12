import { Component, computed, input } from '@angular/core';
import { Publicacion as PublicacionModelo } from '../../models/publicacion';
import { Iniciales } from '../../pipes/iniciales';
import { TiempoRelativo } from '../../pipes/tiempo-relativo';

@Component({
  selector: 'app-publicacion',
  imports: [Iniciales, TiempoRelativo],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class Publicacion {
  publicacion = input.required<PublicacionModelo>();

  nombreAutor = computed(() => {
    const autor = this.publicacion().autor;
    return `${autor.nombre} ${autor.apellido}`;
  });

  // "LOG-" + los últimos 4 caracteres del id, en mayúsculas
  codigo = computed(() => `LOG-${this.publicacion()._id.slice(-4).toUpperCase()}`);

  textoMeGusta = computed(() => {
    const cantidad = this.publicacion().cantidadMeGusta;
    return `${cantidad} ${cantidad === 1 ? 'tostado' : 'tostados'}`;
  });

  textoComentarios = computed(() => {
    const cantidad = this.publicacion().cantidadComentarios;
    return `${cantidad} ${cantidad === 1 ? 'transmisión' : 'transmisiones'}`;
  });
}

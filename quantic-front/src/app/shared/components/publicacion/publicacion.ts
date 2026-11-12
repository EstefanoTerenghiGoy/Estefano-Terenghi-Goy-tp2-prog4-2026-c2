import { Component, computed, inject, input, output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
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
  private authService = inject(AuthService);

  publicacion = input.required<PublicacionModelo>();
  // El padre la prende mientras hay un pedido en curso sobre esta publicación
  ocupada = input(false);

  alternarMeGusta = output<void>();
  eliminar = output<void>();

  nombreAutor = computed(() => {
    const autor = this.publicacion().autor;
    return `${autor.nombre} ${autor.apellido}`;
  });

  // "LOG-" + los últimos 4 caracteres del id, en mayúsculas
  codigo = computed(() => `LOG-${this.publicacion()._id.slice(-4).toUpperCase()}`);

  // Solo el autor o un administrador ven el botón (el back vuelve a validarlo)
  puedeEliminar = computed(() => {
    const usuario = this.authService.obtenerUsuario();
    return (
      usuario !== null &&
      (usuario._id === this.publicacion().autor._id || usuario.perfil === 'administrador')
    );
  });

  textoMeGusta = computed(() => {
    const cantidad = this.publicacion().cantidadMeGusta;
    return `${cantidad} ${cantidad === 1 ? 'tostado' : 'tostados'}`;
  });

  textoComentarios = computed(() => {
    const cantidad = this.publicacion().cantidadComentarios;
    return `${cantidad} ${cantidad === 1 ? 'transmisión' : 'transmisiones'}`;
  });
}

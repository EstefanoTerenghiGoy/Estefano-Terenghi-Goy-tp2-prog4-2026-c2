import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComentariosService } from '../../core/services/comentarios.service';
import { ModalService } from '../../core/services/modal.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { esSesionVencida, mensajeDeError } from '../../core/utils/mensaje-error';
import { Comentario } from '../../shared/components/comentario/comentario';
import { Publicacion } from '../../shared/components/publicacion/publicacion';
import { Comentario as ComentarioModelo } from '../../shared/models/comentario';
import { Publicacion as PublicacionModelo } from '../../shared/models/publicacion';

const POR_TANDA = 5; // comentarios que se traen cada vez

@Component({
  selector: 'app-publicacion-detalle',
  imports: [RouterLink, Publicacion, Comentario],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private modalService = inject(ModalService);

  private id = this.ruta.snapshot.paramMap.get('id') ?? '';

  publicacion = signal<PublicacionModelo | null>(null);
  cargando = signal(true);
  noExiste = signal(false); // 404: no existe o está dada de baja
  conError = signal(false);
  ocupada = signal(false); // me gusta o eliminar en curso

  comentarios = signal<ComentarioModelo[]>([]);
  totalComentarios = signal(0);
  cargandoComentarios = signal(true);
  cargandoMas = signal(false);
  errorComentarios = signal(false);

  hayMas = computed(() => this.comentarios().length < this.totalComentarios());

  async ngOnInit(): Promise<void> {
    await this.cargarPublicacion();
    // Si la publicación no existe, tampoco hay transmisiones para pedir
    if (this.publicacion()) {
      await this.cargarComentarios();
    }
  }

  async cargarPublicacion(): Promise<void> {
    this.cargando.set(true);
    this.conError.set(false);
    try {
      this.publicacion.set(await this.publicacionesService.obtenerPorId(this.id));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.noExiste.set(true);
      } else {
        this.conError.set(true);
        this.mostrarError('No se pudo cargar la publicación', error);
      }
    } finally {
      this.cargando.set(false);
    }
  }

  // Primera tanda de comentarios
  async cargarComentarios(): Promise<void> {
    this.cargandoComentarios.set(true);
    this.errorComentarios.set(false);
    try {
      const respuesta = await this.comentariosService.listar(this.id, {
        offset: 0,
        limit: POR_TANDA,
      });
      this.comentarios.set(respuesta.datos);
      this.totalComentarios.set(respuesta.total);
    } catch (error) {
      this.errorComentarios.set(true);
      this.mostrarError('No se pudieron cargar las transmisiones', error);
    } finally {
      this.cargandoComentarios.set(false);
    }
  }

  // Trae los 5 siguientes y los agrega al final, sin quitar los que ya están
  async cargarMas(): Promise<void> {
    if (this.cargandoMas()) {
      return;
    }
    this.cargandoMas.set(true);
    try {
      const respuesta = await this.comentariosService.listar(this.id, {
        offset: this.comentarios().length,
        limit: POR_TANDA,
      });
      this.comentarios.update((lista) => {
        const ids = new Set(lista.map((c) => c._id));
        return [...lista, ...respuesta.datos.filter((c) => !ids.has(c._id))];
      });
      this.totalComentarios.set(respuesta.total);
    } catch (error) {
      this.mostrarError('No se pudieron cargar más transmisiones', error);
    } finally {
      this.cargandoMas.set(false);
    }
  }

  // Lo va a usar el formulario de nueva transmisión (paso 6): el comentario nuevo va primero
  agregarComentario(comentario: ComentarioModelo): void {
    this.comentarios.update((lista) => [comentario, ...lista]);
    this.totalComentarios.update((total) => total + 1);
    this.publicacion.update((p) => (p ? { ...p, cantidadComentarios: p.cantidadComentarios + 1 } : p));
  }

  async alternarMeGusta(): Promise<void> {
    const actual = this.publicacion();
    if (!actual || this.ocupada()) {
      return;
    }
    this.ocupada.set(true);
    try {
      const resultado = await this.publicacionesService.alternarMeGusta(actual);
      if (resultado === 'conflicto') {
        await this.cargarPublicacion(); // el servidor ya lo tenía así: se sincroniza
      } else if (resultado) {
        this.publicacion.set({ ...actual, ...resultado });
      }
    } finally {
      this.ocupada.set(false);
    }
  }

  async eliminar(): Promise<void> {
    const actual = this.publicacion();
    if (!actual || this.ocupada()) {
      return;
    }
    this.ocupada.set(true);
    try {
      const resultado = await this.publicacionesService.confirmarYEliminar(actual);
      if (resultado === 'eliminada') {
        await this.router.navigate(['/publicaciones']);
      } else if (resultado === 'inexistente') {
        this.publicacion.set(null);
        this.noExiste.set(true);
      }
    } finally {
      this.ocupada.set(false);
    }
  }

  private mostrarError(titulo: string, error: unknown): void {
    if (esSesionVencida(error)) {
      return; // el interceptor ya te mandó al login
    }
    this.modalService.mostrarError(
      titulo,
      mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
    );
  }
}

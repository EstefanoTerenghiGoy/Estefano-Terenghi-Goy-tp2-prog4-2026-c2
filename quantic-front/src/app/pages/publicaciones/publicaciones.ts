import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { esSesionVencida, mensajeDeError } from '../../core/utils/mensaje-error';
import { NuevaPublicacion } from '../../shared/components/nueva-publicacion/nueva-publicacion';
import { Paginacion } from '../../shared/components/paginacion/paginacion';
import { Publicacion } from '../../shared/components/publicacion/publicacion';
import {
  OrdenPublicaciones,
  Publicacion as PublicacionModelo,
} from '../../shared/models/publicacion';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [Publicacion, Paginacion, NuevaPublicacion],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private modalService = inject(ModalService);

  inicioLista = viewChild.required<ElementRef<HTMLElement>>('inicioLista');

  publicaciones = signal<PublicacionModelo[]>([]);
  total = signal(0);
  orden = signal<OrdenPublicaciones>('fecha');
  pagina = signal(1);
  cargando = signal(true);
  conError = signal(false);
  // Ids con un pedido en curso (me gusta o eliminar): sus botones quedan deshabilitados
  ocupadas = signal<string[]>([]);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  // si el usuario cambia de página rápido, solo vale la última respuesta
  private ultimoPedido = 0;

  ngOnInit(): void {
    this.cargar();
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (orden === this.orden()) {
      return;
    }
    this.orden.set(orden);
    this.pagina.set(1); // al cambiar el orden se vuelve a la primera página
    this.cargar();
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar();
    this.inicioLista().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Después de crear una entrada: se muestra primera en la página 1 ordenada por fecha
  alCrear(): void {
    this.orden.set('fecha');
    this.pagina.set(1);
    this.cargar();
  }

  async alternarMeGusta(publicacion: PublicacionModelo): Promise<void> {
    if (this.ocupadas().includes(publicacion._id)) {
      return;
    }
    this.marcarOcupada(publicacion._id, true);
    try {
      const estado = publicacion.meGustaMio
        ? await this.publicacionesService.quitarMeGusta(publicacion._id)
        : await this.publicacionesService.darMeGusta(publicacion._id);
      // Se reemplaza solo esa publicación; la lista no se reordena
      this.publicaciones.update((lista) =>
        lista.map((p) => (p._id === publicacion._id ? { ...p, ...estado } : p)),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // El me gusta ya estaba así en el servidor (otra pestaña, por ejemplo): se sincroniza
        await this.cargar();
      } else {
        this.mostrarErrorDeAccion('No se pudo actualizar el me gusta', error);
      }
    } finally {
      this.marcarOcupada(publicacion._id, false);
    }
  }

  async eliminar(publicacion: PublicacionModelo): Promise<void> {
    if (this.ocupadas().includes(publicacion._id)) {
      return;
    }
    const confirmo = await this.modalService.confirmar(
      'Eliminar entrada',
      `¿Seguro que querés eliminar «${publicacion.titulo}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmo) {
      return;
    }
    this.marcarOcupada(publicacion._id, true);
    try {
      await this.publicacionesService.eliminar(publicacion._id);
      // Si era la única de la página y no es la primera, se vuelve a la anterior
      if (this.publicaciones().length <= 1 && this.pagina() > 1) {
        this.pagina.update((p) => p - 1);
      }
      await this.cargar();
    } catch (error) {
      this.mostrarErrorDeAccion('No se pudo eliminar la entrada', error);
      if (error instanceof HttpErrorResponse && error.status === 404) {
        await this.cargar(); // ya no existía: se actualiza la lista
      }
    } finally {
      this.marcarOcupada(publicacion._id, false);
    }
  }

  async cargar(): Promise<void> {
    const pedido = ++this.ultimoPedido;
    this.cargando.set(true);
    this.conError.set(false);
    try {
      const respuesta = await this.publicacionesService.listar({
        orden: this.orden(),
        offset: (this.pagina() - 1) * POR_PAGINA,
        limit: POR_PAGINA,
      });
      if (pedido !== this.ultimoPedido) {
        return;
      }
      this.publicaciones.set(respuesta.datos);
      this.total.set(respuesta.total);
    } catch (error) {
      if (pedido !== this.ultimoPedido) {
        return;
      }
      this.conError.set(true);
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudieron cargar las entradas',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      if (pedido === this.ultimoPedido) {
        this.cargando.set(false);
      }
    }
  }

  private marcarOcupada(id: string, ocupada: boolean): void {
    this.ocupadas.update((ids) => (ocupada ? [...ids, id] : ids.filter((x) => x !== id)));
  }

  private mostrarErrorDeAccion(titulo: string, error: unknown): void {
    if (esSesionVencida(error)) {
      return;
    }
    this.modalService.mostrarError(
      titulo,
      mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
    );
  }
}

import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { mensajeDeError } from '../../core/utils/mensaje-error';
import { Paginacion } from '../../shared/components/paginacion/paginacion';
import { Publicacion } from '../../shared/components/publicacion/publicacion';
import {
  OrdenPublicaciones,
  Publicacion as PublicacionModelo,
} from '../../shared/models/publicacion';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [Publicacion, Paginacion],
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

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  // Cuenta los pedidos: si el usuario cambia de página rápido, solo vale la última respuesta
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
      this.modalService.mostrarError(
        'No se pudieron cargar las entradas',
        mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
      );
    } finally {
      if (pedido === this.ultimoPedido) {
        this.cargando.set(false);
      }
    }
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ComentariosService } from '../../core/services/comentarios.service';
import { ModalService } from '../../core/services/modal.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { esSesionVencida, mensajeDeError } from '../../core/utils/mensaje-error';
import { RespuestaComentarios } from '../../shared/models/comentario';
import { Publicacion } from '../../shared/models/publicacion';
import { FechaLarga } from '../../shared/pipes/fecha-larga';
import { Iniciales } from '../../shared/pipes/iniciales';
import { TiempoRelativo } from '../../shared/pipes/tiempo-relativo';

// Una publicación del perfil junto con sus primeros comentarios
interface EntradaPerfil {
  publicacion: Publicacion;
  comentarios: RespuestaComentarios;
}

const CANTIDAD_ENTRADAS = 3;
const CANTIDAD_COMENTARIOS = 3;

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, Iniciales, FechaLarga, TiempoRelativo],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private modalService = inject(ModalService);

  usuario = signal(this.authService.obtenerUsuario());

  entradas = signal<EntradaPerfil[]>([]);
  cargando = signal(true);
  conError = signal(false);

  nombreCompleto = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre} ${u.apellido}` : '';
  });

  insignia = computed(() => (this.usuario()?.perfil === 'administrador' ? 'ADMIN' : 'USUARIO'));

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    this.cargando.set(true);
    this.conError.set(false);
    try {
      const { datos } = await this.publicacionesService.listar({
        orden: 'fecha',
        offset: 0,
        limit: CANTIDAD_ENTRADAS,
        usuarioId: usuario._id,
      });
      // Los comentarios de todas las publicaciones se piden a la vez
      const comentarios = await Promise.all(
        datos.map((p) =>
          this.comentariosService.listar(p._id, { offset: 0, limit: CANTIDAD_COMENTARIOS }),
        ),
      );
      this.entradas.set(datos.map((publicacion, i) => ({ publicacion, comentarios: comentarios[i] })));
    } catch (error) {
      this.conError.set(true);
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudieron cargar tus entradas',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.cargando.set(false);
    }
  }
}

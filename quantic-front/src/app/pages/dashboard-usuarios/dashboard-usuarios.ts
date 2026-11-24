import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { esSesionVencida, mensajeDeError } from '../../core/utils/mensaje-error';
import { NuevoUsuario } from '../../shared/components/nuevo-usuario/nuevo-usuario';
import { Usuario } from '../../shared/models/usuario';
import { Iniciales } from '../../shared/pipes/iniciales';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [Iniciales, NuevoUsuario],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  conError = signal(false);
  creando = signal(false); // formulario de "Nuevo usuario" abierto
  ocupadoId = signal<string | null>(null); // fila con un pedido en curso

  // Al propio administrador no se le muestra el botón (no puede deshabilitarse a sí mismo)
  idPropio = this.authService.usuario()?._id;

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.conError.set(false);
    try {
      this.usuarios.set(await this.usuariosService.listar());
    } catch (error) {
      this.conError.set(true);
      this.mostrarError('No se pudieron cargar los usuarios', error);
    } finally {
      this.cargando.set(false);
    }
  }

  alCrear(): void {
    this.creando.set(false);
    this.cargar();
  }

  // Deshabilita o habilita según el estado actual, con confirmación
  async cambiarEstado(usuario: Usuario): Promise<void> {
    if (this.ocupadoId()) {
      return;
    }
    const deshabilitar = usuario.activo;
    const confirmo = await this.modalService.confirmar(
      deshabilitar ? 'Deshabilitar usuario' : 'Habilitar usuario',
      deshabilitar
        ? `@${usuario.nombreUsuario} no va a poder iniciar sesión hasta que lo vuelvas a habilitar.`
        : `@${usuario.nombreUsuario} va a poder volver a iniciar sesión.`,
      { texto: deshabilitar ? 'Deshabilitar' : 'Habilitar', peligro: deshabilitar },
    );
    if (!confirmo) {
      return;
    }
    this.ocupadoId.set(usuario._id);
    try {
      const actualizado = deshabilitar
        ? await this.usuariosService.deshabilitar(usuario._id)
        : await this.usuariosService.habilitar(usuario._id);
      this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
    } catch (error) {
      this.mostrarError(
        deshabilitar ? 'No se pudo deshabilitar el usuario' : 'No se pudo habilitar el usuario',
        error,
      );
    } finally {
      this.ocupadoId.set(null);
    }
  }

  private mostrarError(titulo: string, error: unknown): void {
    if (!esSesionVencida(error)) {
      this.modalService.mostrarError(
        titulo,
        mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
      );
    }
  }
}

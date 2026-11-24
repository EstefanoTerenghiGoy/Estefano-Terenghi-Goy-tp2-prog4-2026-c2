import { Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { esSesionVencida, mensajeDeError } from '../../../core/utils/mensaje-error';
import { Usuario } from '../../models/usuario';
import { fechaNoFutura, hoy } from '../../validators/validadores';

const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB

// Formulario para editar el propio perfil. Correo y usuario se muestran pero no se pueden cambiar
@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  usuario = input.required<Usuario>();
  guardado = output<void>();
  cancelar = output<void>();

  hoy = hoy();
  enviando = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    descripcion: ['', [Validators.required, Validators.maxLength(300)]],
  });

  // Se precarga con los datos actuales
  ngOnInit(): void {
    const u = this.usuario();
    this.form.setValue({
      nombre: u.nombre,
      apellido: u.apellido,
      fechaNacimiento: u.fechaNacimiento.slice(0, 10), // "1999-01-31T00:00:00.000Z" -> "1999-01-31"
      descripcion: u.descripcion,
    });
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const elegido = input.files?.[0];
    if (!elegido) {
      return;
    }
    this.quitarImagen();
    if (!elegido.type.startsWith('image/')) {
      input.value = '';
      this.errorImagen.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (elegido.size > MAX_IMAGEN) {
      input.value = '';
      this.errorImagen.set('La imagen no puede pesar más de 5 MB.');
      return;
    }
    this.archivo.set(elegido);
    this.vistaPrevia.set(URL.createObjectURL(elegido));
  }

  async guardar(): Promise<void> {
    if (this.enviando()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    try {
      const datos = new FormData();
      for (const [campo, valor] of Object.entries(this.form.getRawValue())) {
        datos.append(campo, valor);
      }
      const archivo = this.archivo();
      if (archivo) {
        datos.append('imagen', archivo);
      }
      const actualizado = await this.usuariosService.editarPerfil(datos);
      this.authService.actualizarUsuario(actualizado); // el perfil y el navbar se actualizan solos
      this.guardado.emit();
    } catch (error) {
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudo guardar el perfil',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnDestroy(): void {
    this.quitarImagen();
  }

  private quitarImagen(): void {
    const url = this.vistaPrevia();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.archivo.set(null);
    this.vistaPrevia.set(null);
    this.errorImagen.set('');
  }
}

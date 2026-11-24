import { Component, OnDestroy, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { esSesionVencida, mensajeDeError } from '../../../core/utils/mensaje-error';
import { Usuario } from '../../models/usuario';
import { BotonOjo } from '../boton-ojo/boton-ojo';
import {
  fechaNoFutura,
  hoy,
  passwordValida,
  passwordsIguales,
} from '../../validators/validadores';

const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB

// Alta de un usuario por un administrador: los mismos campos y validaciones que el registro,
// más el perfil (usuario o administrador)
@Component({
  selector: 'app-nuevo-usuario',
  imports: [ReactiveFormsModule, BotonOjo],
  templateUrl: './nuevo-usuario.html',
  styleUrl: './nuevo-usuario.css',
})
export class NuevoUsuario implements OnDestroy {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private modalService = inject(ModalService);

  creado = output<Usuario>();
  cancelar = output<void>();

  hoy = hoy();
  enviando = signal(false);
  verPassword = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal('');

  form = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: ['', [Validators.required, passwordValida]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
      perfil: ['usuario' as 'usuario' | 'administrador', Validators.required],
    },
    { validators: passwordsIguales },
  );

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  repetirInvalido(): boolean {
    const control = this.form.controls.repetirPassword;
    return control.touched && (control.invalid || this.form.hasError('noCoinciden'));
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

  async enviar(): Promise<void> {
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
      this.creado.emit(await this.usuariosService.crear(datos));
    } catch (error) {
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudo crear el usuario',
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

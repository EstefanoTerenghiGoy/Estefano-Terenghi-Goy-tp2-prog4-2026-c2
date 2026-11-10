import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { mensajeDeError } from '../../core/utils/mensaje-error';
import { BotonOjo } from '../../shared/components/boton-ojo/boton-ojo';
import { PantallaAuth } from '../../shared/components/pantalla-auth/pantalla-auth';
import { Iniciales } from '../../shared/pipes/iniciales';
import {
  fechaNoFutura,
  hoy,
  passwordValida,
  passwordsIguales,
} from '../../shared/validators/validadores';

const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, PantallaAuth, BotonOjo, Iniciales],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  enviando = signal(false);
  verPassword = signal(false);
  verRepetir = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal('');
  hoy = hoy();

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
    if (!elegido.type.startsWith('image/')) {
      this.rechazarImagen(input, 'El archivo tiene que ser una imagen.');
      return;
    }
    if (elegido.size > MAX_IMAGEN) {
      this.rechazarImagen(input, 'La imagen no puede pesar más de 5 MB.');
      return;
    }
    this.errorImagen.set('');
    this.archivo.set(elegido);
    this.liberarVistaPrevia();
    //Vista previa nativo con HTML
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
      const respuesta = await this.authService.registro(datos);
      this.authService.guardarSesion(respuesta.token, respuesta.usuario);
      await this.router.navigate(['/publicaciones']);
    } catch (error) {
      this.modalService.mostrarError(
        'No se pudo crear la cuenta',
        mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
      );
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  private rechazarImagen(input: HTMLInputElement, mensaje: string): void {
    input.value = '';
    this.archivo.set(null);
    this.liberarVistaPrevia();
    this.vistaPrevia.set(null);
    this.errorImagen.set(mensaje);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

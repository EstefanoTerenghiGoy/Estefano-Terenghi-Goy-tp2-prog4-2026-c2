import { Component, OnDestroy, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { esSesionVencida, mensajeDeError } from '../../../core/utils/mensaje-error';

const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB
const MAX_TITULO = 100;
const MAX_MENSAJE = 500;

@Component({
  selector: 'app-nueva-publicacion',
  imports: [ReactiveFormsModule],
  templateUrl: './nueva-publicacion.html',
  styleUrl: './nueva-publicacion.css',
})
export class NuevaPublicacion implements OnDestroy {
  private fb = inject(FormBuilder);
  private publicacionesService = inject(PublicacionesService);
  private modalService = inject(ModalService);

  // Avisa al padre cuando la publicación se creó bien
  creada = output<void>();

  maxTitulo = MAX_TITULO;
  maxMensaje = MAX_MENSAJE;

  enviando = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorImagen = signal('');

  // El patrón /\S/ rechaza textos que son solo espacios
  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_TITULO)]],
    descripcion: [
      '',
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_MENSAJE)],
    ],
  });

  invalido(campo: 'titulo' | 'descripcion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
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
    this.liberarVistaPrevia();
    this.archivo.set(elegido);
    this.vistaPrevia.set(URL.createObjectURL(elegido));
  }

  quitarImagen(input: HTMLInputElement): void {
    input.value = ''; // si no, el navegador no avisa al elegir de nuevo el mismo archivo
    this.archivo.set(null);
    this.liberarVistaPrevia();
    this.vistaPrevia.set(null);
    this.errorImagen.set('');
  }

  async enviar(input: HTMLInputElement): Promise<void> {
    if (this.enviando()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    try {
      const { titulo, descripcion } = this.form.getRawValue();
      const datos = new FormData();
      datos.append('titulo', titulo.trim());
      datos.append('descripcion', descripcion.trim());
      const archivo = this.archivo();
      if (archivo) {
        datos.append('imagen', archivo);
      }
      await this.publicacionesService.crear(datos);
      this.form.reset();
      this.quitarImagen(input);
      this.creada.emit();
    } catch (error) {
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudo registrar la entrada',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  private rechazarImagen(input: HTMLInputElement, mensaje: string): void {
    this.quitarImagen(input);
    this.errorImagen.set(mensaje);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

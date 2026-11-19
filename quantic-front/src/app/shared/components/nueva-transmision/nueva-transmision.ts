import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { ModalService } from '../../../core/services/modal.service';
import { esSesionVencida, mensajeDeError } from '../../../core/utils/mensaje-error';
import { Comentario } from '../../models/comentario';
import { MAX_COMENTARIO, mensajeComentario } from '../../validators/validadores';

@Component({
  selector: 'app-nueva-transmision',
  imports: [ReactiveFormsModule],
  templateUrl: './nueva-transmision.html',
  styleUrl: './nueva-transmision.css',
})
export class NuevaTransmision {
  private fb = inject(FormBuilder);
  private comentariosService = inject(ComentariosService);
  private modalService = inject(ModalService);

  publicacionId = input.required<string>();
  // Avisa al padre con el comentario que devolvió el back, para que lo agregue a la lista
  creada = output<Comentario>();

  maximo = MAX_COMENTARIO;
  enviando = signal(false);

  form = this.fb.nonNullable.group({
    mensaje: ['', mensajeComentario],
  });

  // Largo sin contar los espacios del principio y del final (igual que la validación)
  largo(): number {
    return this.form.controls.mensaje.value.trim().length;
  }

  async enviar(): Promise<void> {
    if (this.enviando() || this.form.invalid) {
      return;
    }
    this.enviando.set(true);
    try {
      const mensaje = this.form.controls.mensaje.value.trim();
      const comentario = await this.comentariosService.crear(this.publicacionId(), mensaje);
      this.form.reset();
      this.creada.emit(comentario);
    } catch (error) {
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudo enviar la transmisión',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

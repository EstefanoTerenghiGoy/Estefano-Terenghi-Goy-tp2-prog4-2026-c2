import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Comentario as ComentarioModelo } from '../../models/comentario';
import { Iniciales } from '../../pipes/iniciales';
import { TiempoRelativo } from '../../pipes/tiempo-relativo';
import { MAX_COMENTARIO, mensajeComentario } from '../../validators/validadores';

// Una transmisión (comentario). El mensaje va como texto normal; en el paso 7 se le suma la capa de
// glifos sobre el mismo bloque del mensaje, sin tocar el resto.
@Component({
  selector: 'app-comentario',
  imports: [Iniciales, TiempoRelativo, ReactiveFormsModule],
  templateUrl: './comentario.html',
  styleUrl: './comentario.css',
})
export class Comentario {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  comentario = input.required<ComentarioModelo>();
  // El padre la prende mientras se guarda la edición: los botones quedan deshabilitados
  ocupado = input(false);
  // Mensaje nuevo (ya sin espacios a los lados). El padre hace el pedido y reemplaza el comentario
  editar = output<string>();

  maximo = MAX_COMENTARIO;
  areaEdicion = viewChild<ElementRef<HTMLTextAreaElement>>('areaEdicion');

  form = this.fb.nonNullable.group({
    mensaje: ['', mensajeComentario],
  });

  nombreAutor = computed(() => {
    const autor = this.comentario().autor;
    return `${autor.nombre} ${autor.apellido}`;
  });

  // Solo el autor del comentario ve "Editar" (tampoco los administradores)
  esAutor = computed(() => this.authService.obtenerUsuario()?._id === this.comentario().autor._id);

  // Modo edición: se guarda sobre qué comentario se abrió. Cuando el padre lo reemplaza por el que
  // devolvió el back ya no coincide, y la edición se cierra sola. Si falla, sigue abierta.
  private editandoSobre = signal<ComentarioModelo | null>(null);
  editando = computed(() => this.editandoSobre() === this.comentario());

  empezarEdicion(): void {
    this.form.setValue({ mensaje: this.comentario().mensaje });
    this.editandoSobre.set(this.comentario());
    setTimeout(() => this.areaEdicion()?.nativeElement.focus());
  }

  cancelar(): void {
    if (!this.ocupado()) {
      this.editandoSobre.set(null);
    }
  }

  guardar(): void {
    if (this.ocupado() || this.form.invalid) {
      return;
    }
    const mensaje = this.form.controls.mensaje.value.trim();
    if (mensaje === this.comentario().mensaje) {
      this.cancelar(); // no cambió nada: no se hace el pedido
      return;
    }
    this.editar.emit(mensaje);
  }

  // Largo sin contar los espacios del principio y del final (igual que la validación)
  largo(): number {
    return this.form.controls.mensaje.value.trim().length;
  }
}

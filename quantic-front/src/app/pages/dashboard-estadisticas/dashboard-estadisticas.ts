import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { ModalService } from '../../core/services/modal.service';
import { esSesionVencida, mensajeDeError } from '../../core/utils/mensaje-error';
import { Grafico } from '../../shared/components/grafico/grafico';
import {
  ComentariosPorPublicacion,
  ComentariosTotal,
  PublicacionesPorUsuario,
} from '../../shared/models/estadisticas';

// Fecha local como YYYY-MM-DD (el formato del input type="date")
function fechaLocal(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA');
}

// "desde" no puede ser posterior a "hasta"
const lapsoValido: ValidatorFn = (grupo) => {
  const { desde, hasta } = grupo.value;
  return desde && hasta && desde > hasta ? { lapsoInvalido: true } : null;
};

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [ReactiveFormsModule, Grafico],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  private fb = inject(FormBuilder);
  private estadisticasService = inject(EstadisticasService);
  private modalService = inject(ModalService);

  // Por defecto, los últimos 30 días
  form = this.fb.nonNullable.group(
    {
      desde: [fechaLocal(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), Validators.required],
      hasta: [fechaLocal(new Date()), Validators.required],
    },
    { validators: lapsoValido },
  );

  cargando = signal(true);
  conError = signal(false);
  porUsuario = signal<PublicacionesPorUsuario[]>([]);
  comentarios = signal<ComentariosTotal>({ total: 0, porDia: [] });
  porPublicacion = signal<ComentariosPorPublicacion[]>([]);

  // Datos listos para cada gráfico
  etiquetasUsuarios = computed(() => this.porUsuario().map((x) => '@' + x.usuario));
  datosUsuarios = computed(() => this.porUsuario().map((x) => x.cantidad));
  etiquetasDias = computed(() =>
    this.comentarios().porDia.map((d) => `${d.fecha.slice(8, 10)}/${d.fecha.slice(5, 7)}`),
  );
  datosDias = computed(() => this.comentarios().porDia.map((d) => d.cantidad));
  tituloDias = computed(() => `Comentarios por día · total ${this.comentarios().total}`);
  etiquetasPublicaciones = computed(() =>
    this.porPublicacion().map((x) => (x.titulo.length > 22 ? x.titulo.slice(0, 21) + '…' : x.titulo)),
  );
  datosPublicaciones = computed(() => this.porPublicacion().map((x) => x.cantidad));

  ngOnInit(): void {
    this.actualizar();
  }

  async actualizar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const lapso = this.form.getRawValue();
    this.cargando.set(true);
    this.conError.set(false);
    try {
      // Las tres estadísticas se piden a la vez
      const [porUsuario, comentarios, porPublicacion] = await Promise.all([
        this.estadisticasService.publicacionesPorUsuario(lapso),
        this.estadisticasService.comentariosTotal(lapso),
        this.estadisticasService.comentariosPorPublicacion(lapso),
      ]);
      this.porUsuario.set(porUsuario);
      this.comentarios.set(comentarios);
      this.porPublicacion.set(porPublicacion);
    } catch (error) {
      this.conError.set(true);
      if (!esSesionVencida(error)) {
        this.modalService.mostrarError(
          'No se pudieron cargar las estadísticas',
          mensajeDeError(error, 'Ocurrió un error inesperado. Probá de nuevo.'),
        );
      }
    } finally {
      this.cargando.set(false);
    }
  }
}

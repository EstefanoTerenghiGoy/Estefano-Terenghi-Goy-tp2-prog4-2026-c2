import { Pipe, PipeTransform } from '@angular/core';

const MINUTO = 60;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

// "2026-11-12T21:24:40Z" -> "hace unos segundos", "hace 5 min", "hace 3 h", "hace 2 días"
// Pasados los 30 días muestra la fecha corta (dd/mm/aaaa)
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativo implements PipeTransform {
  transform(fecha: string | null | undefined): string {
    const momento = new Date(fecha ?? '');
    if (Number.isNaN(momento.getTime())) {
      return '';
    }
    // Si el reloj del equipo está atrasado, la diferencia puede dar negativa
    const segundos = Math.max(0, Math.floor((Date.now() - momento.getTime()) / 1000));

    if (segundos < MINUTO) {
      return 'hace unos segundos';
    }
    if (segundos < HORA) {
      return `hace ${Math.floor(segundos / MINUTO)} min`;
    }
    if (segundos < DIA) {
      return `hace ${Math.floor(segundos / HORA)} h`;
    }
    const dias = Math.floor(segundos / DIA);
    if (dias <= 30) {
      return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    }
    return momento.toLocaleDateString('es-AR');
  }
}

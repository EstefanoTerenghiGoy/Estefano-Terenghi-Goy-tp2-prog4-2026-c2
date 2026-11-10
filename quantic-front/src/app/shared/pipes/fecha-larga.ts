import { Pipe, PipeTransform } from '@angular/core';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// "2001-03-14" (o "2001-03-14T00:00:00.000Z") -> "14 de marzo de 2001"
@Pipe({ name: 'fechaLarga' })
export class FechaLarga implements PipeTransform {
  transform(fecha: string | null | undefined): string {
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha ?? '');
    if (!coincidencia) {
      return '';
    }
    const [, anio, mes, dia] = coincidencia;
    const nombreMes = MESES[Number(mes) - 1];
    return nombreMes ? `${Number(dia)} de ${nombreMes} de ${anio}` : '';
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iniciales' })
export class Iniciales implements PipeTransform {
  transform(nombre: string | null | undefined): string {
    const palabras = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
    if (palabras.length === 0) {
      return '?';
    }
    const primera = palabras[0].charAt(0);
    const ultima = palabras.length > 1 ? palabras[palabras.length - 1].charAt(0) : '';
    return (primera + ultima).toUpperCase();
  }
}

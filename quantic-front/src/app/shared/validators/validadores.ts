import { ValidatorFn } from '@angular/forms';

export function hoy(): string {
  return new Date().toLocaleDateString('en-CA');
}

export const passwordValida: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  const cumple = valor.length >= 8 && /[A-Z]/.test(valor) && /\d/.test(valor);
  return cumple ? null : { passwordDebil: true };
};

export const passwordsIguales: ValidatorFn = (grupo) => {
  const igual = grupo.get('password')?.value === grupo.get('repetirPassword')?.value;
  return igual ? null : { noCoinciden: true };
};

export const MAX_COMENTARIO = 300;

// Mensaje de una transmisión: sin contar los espacios del principio y del final, de 1 a 300
// caracteres. Un mensaje de solo espacios es inválido.
export const mensajeComentario: ValidatorFn = (control) => {
  const largo = (control.value ?? '').trim().length;
  if (largo === 0) {
    return { required: true };
  }
  return largo > MAX_COMENTARIO ? { maxlength: true } : null;
};

export const fechaNoFutura: ValidatorFn = (control) => {
  return control.value && control.value > hoy() ? { fechaFutura: true } : null;
};
